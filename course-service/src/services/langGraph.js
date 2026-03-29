import {
  StateGraph,
  MessagesAnnotation,
  START,
  END,
} from "@langchain/langgraph";

import env from "../config/env.config.js";
import { ChatGroq } from "@langchain/groq";
import { AIMessage, HumanMessage, SystemMessage } from "@langchain/core/messages";
import pool from "../config/db.config.js";
import { fileURLToPath } from "url";


const sqlPrompt = (role, userId, courseId) => `
You are a PostgreSQL SELECT-only generator for an LMS.

## Schema
course(id, title, description, category[], level, language, instructor_id, price, currency, status, thumbnail_url, created_at)
  level: ENUM('beginner','intermediate','advanced') | status: ENUM('draft','published','archived') | price: integer (smallest unit) | category: text[]

module(id, course_id, title, order_index)
lesson(id, module_id, title, type, content_ref, duration_seconds, order_index, is_preview)
  type: ENUM('video','article','quiz')

quizzes(id, course_id, title, description, time_limit, total_marks, is_published, attempt_start_time, attempt_end_time)
questions(id, quiz_id, question_text, marks, options, correct_option_id)
  options: JSONB [{id, text}]

quiz_attempts(id, quiz_id, student_id, score, status, started_at, submitted_at)
  status: ENUM('in_progress','submitted') | UNIQUE(quiz_id, student_id)
student_answers(id, attempt_id, question_id, selected_option_id, is_correct, marks_awarded)

## Access rules
student:    course WHERE status='published' | quizzes WHERE is_published=TRUE | own attempts only (student_id='${userId}') | NEVER expose correct_option_id
instructor: own courses only (instructor_id='${userId}') | own course quizzes/attempts | CAN see correct_option_id
admin:      full read access

## Rules
- SELECT / WITH only. Reject any DDL or DML silently with CANNOT_ANSWER.
- LIMIT 50 for lists, LIMIT 1 for single lookups.
- Violations of role rules → CANNOT_ANSWER. Ambiguous or unsafe → CANNOT_ANSWER.
- Category filter: WHERE 'value' = ANY(category) | Price display: price/100.0 | Duration: duration_seconds/60
- If courseId is provided (${courseId || "none"}), scope course-related queries to that course id unless user asks clearly for global data.
- For question counting, use proper foreign keys (e.g., questions.quiz_id = quizzes.id). Never join questions.id = lesson.id.
- lesson does NOT have question_id. To link module lessons and quizzes, use lesson.content_ref = 'quiz:' || quizzes.id::text and lesson.type = 'quiz'.
- For count queries, return exactly one row with alias total_count.
- Return the query only. No explanation, no markdown.
`;

const summaryPrompt = (role) => `
You are an LMS assistant summarizing SQL results for a ${role}.

- Plain language only. No SQL, no JSON, no UUIDs.
- Empty result → say nothing was found, suggest why.
- SQL_ERROR → explain simply, ask user to rephrase.
- CANNOT_ANSWER → say it's out of scope, suggest a related question.
- Prices: convert to readable format (49900 INR → ₹499). Durations: seconds → minutes/hours.
- Quiz scores: show score/total and %. Flag ≥80% positively.
- Tone: student=friendly | instructor=professional | admin=concise.
- Never expose correct_option_id to students.
`;

const extractSQL = (text = "") => {
  const fenced = text.match(/```sql\s*([\s\S]*?)```/i);
  if (fenced?.[1]) return fenced[1].trim();
  return text.trim();
};

const retrive = async (query) => {
  return pool.query(query);
};

const createModel = () => {
  return new ChatGroq({
    apiKey: env.GROQ_API_KEY,

    model: env.GROQ_MODEL || "llama-3.3-70b-versatile",
    temperature: 0,
    maxRetries: 3,
  });
};

const textToSQL = async (state) => {
  const model = createModel();
  console.log("Calling LLM (textToSQL)...");

  const requesterMessage = state.messages.find((m) => m?._getType?.() === "human");
  const role = requesterMessage?.additional_kwargs?.role || "student";
  const userId = requesterMessage?.additional_kwargs?.userId || "anonymous";
  const courseId = requesterMessage?.additional_kwargs?.courseId || null;

  const response = await model.invoke([
    new SystemMessage(sqlPrompt(role, userId, courseId)),
    ...state.messages,
  ]);
  console.log("textToSQL AI message:", response.content);

  const sqlQuery = extractSQL(response.content);
  console.log("Generated SQL:", sqlQuery);

  if (sqlQuery === "CANNOT_ANSWER") {
    return {
      messages: [
        response,
        new HumanMessage("CANNOT_ANSWER"),
      ],
    };
  }

  try {
    const res = await retrive(sqlQuery);
    console.log("DB rows fetched:", res.rows.length);

    return {
      messages: [
        response,
        new HumanMessage(`SQL_RESULT_JSON: ${JSON.stringify(res.rows)}`),
      ],
    };
  } catch (error) {
    console.log("DB error:", error.message);

    const shouldRepair = /does not exist|syntax error|invalid input/i.test(String(error.message || ""));
    if (shouldRepair) {
      try {
        const repairResponse = await model.invoke([
          new SystemMessage(`
You are fixing a failed PostgreSQL query for this LMS schema.
- SELECT/WITH only.
- questions columns: id, quiz_id, question_text, marks, options, correct_option_id
- lesson columns: id, module_id, title, type, content_ref, order_index
- quizzes columns include id, course_id
- lesson does NOT have question_id.
- module↔quiz link via lesson.content_ref = 'quiz:' || quizzes.id::text (and lesson.type='quiz').
Return corrected SQL only, no markdown.
          `),
          new HumanMessage(`Original SQL:\n${sqlQuery}\n\nDB_ERROR:\n${error.message}`),
        ]);

        const repairedSQL = extractSQL(repairResponse.content);
        console.log("Repaired SQL:", repairedSQL);

        const repairedResult = await retrive(repairedSQL);
        console.log("DB rows fetched after repair:", repairedResult.rows.length);

        return {
          messages: [
            repairResponse,
            new HumanMessage(`SQL_RESULT_JSON: ${JSON.stringify(repairedResult.rows)}`),
          ],
        };
      } catch (repairError) {
        console.log("DB error after repair attempt:", repairError.message);
      }
    }

    return {
      messages: [
        response,
        new HumanMessage(`SQL_ERROR: ${error.message}`),
      ],
    };
  }
};

const summarizeData = async (state) => {
  const model = createModel();
  console.log("Calling LLM (summarizeData)...");

  const sqlResultMessage = [...state.messages]
    .reverse()
    .find((m) => m?._getType?.() === "human" && String(m?.content || "").startsWith("SQL_RESULT_JSON:"));

  const sqlErrorMessage = [...state.messages]
    .reverse()
    .find((m) => m?._getType?.() === "human" && String(m?.content || "").startsWith("SQL_ERROR:"));

  if (sqlErrorMessage) {
    const msg = String(sqlErrorMessage.content).replace("SQL_ERROR:", "").trim();
    const fallbackMessage = `I couldn't fetch the data due to a database error: ${msg}. Please rephrase and try again.`;
    console.log("summarizeData AI message:", fallbackMessage);
    return {
      messages: [new AIMessage(fallbackMessage)],
    };
  }

  if (sqlResultMessage) {
    const raw = String(sqlResultMessage.content).replace("SQL_RESULT_JSON:", "").trim();
    try {
      const rows = JSON.parse(raw);
      if (Array.isArray(rows) && rows.length === 1 && rows[0] && typeof rows[0] === "object") {
        const row = rows[0];
        const countKey = Object.keys(row).find((key) => /count/i.test(key));
        if (countKey && Number.isFinite(Number(row[countKey]))) {
          const countValue = Number(row[countKey]);
          const countMessage = `There are ${countValue} questions.`;
          console.log("summarizeData AI message:", countMessage);
          return {
            messages: [new AIMessage(countMessage)],
          };
        }
      }
    } catch {
      // Fall through to LLM summarization
    }
  }

  const requesterMessage = state.messages.find((m) => m?._getType?.() === "human");
  const role = requesterMessage?.additional_kwargs?.role || "student";

  const summarize = await model.invoke([
    new SystemMessage(summaryPrompt(role)),
    ...state.messages,
  ]);
  console.log("summarizeData AI message:", summarize.content);

  return { messages: [summarize] };
};

export const workFlow = new StateGraph(MessagesAnnotation)
  .addNode("textToSQL", textToSQL)
  .addNode("summarize", summarizeData)
  .addEdge(START, "textToSQL")
  .addEdge("textToSQL", "summarize")
  .addEdge("summarize", END);

export const app = workFlow.compile();

export const askCourseAI = async (message, context = {}) => {
  if (!env.GROQ_API_KEY) {
    throw new Error("GROQ_API_KEY is missing. Add it to course-service/.env");
  }

  const role = context.role || "student";
  const userId = context.userId || "anonymous";
  const courseId = context.courseId || null;

  const finalState = await app.invoke({
    messages: [new HumanMessage({
      content: message,
      additional_kwargs: { role, userId, courseId },
    })],
  });

  const finalAi = finalState.messages[finalState.messages.length - 1];
  return finalAi?.content ?? "No AI message";
};

const run = async (message = "give 5 course name which are high in price") => {
  const finalAiMessage = await askCourseAI(message);
  console.log("Final AI message:", finalAiMessage);
};

const currentFilePath = fileURLToPath(import.meta.url);
if (process.argv[1] && process.argv[1] === currentFilePath) {
  const cliMessage = process.argv.slice(2).join(" ") || undefined;
  run(cliMessage).catch((error) => {
    console.error("Error running LangGraph:", error.message);
    process.exit(1);
  });
}