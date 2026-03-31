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

const quizStatsPrompt = (role, userId, quizId) => `
You are a PostgreSQL SELECT-only generator for an LMS quiz statistics system.

## Schema
quizzes(id, course_id, title, description, time_limit, total_marks, is_published, attempt_start_time, attempt_end_time)
questions(id, quiz_id, question_text, marks, options, correct_option_id)
  options: JSONB [{id, text}]

quiz_attempts(id, quiz_id, student_id, score, status, started_at, submitted_at)
  status: ENUM('in_progress','submitted') | UNIQUE(quiz_id, student_id)
student_answers(id, attempt_id, question_id, selected_option_id, is_correct, marks_awarded)

## Access rules
student:    Can view own attempts and answers only (student_id='${userId}')
instructor: Can view all attempts and answers for their course quizzes
admin:      Full read access

## Rules
- SELECT / WITH only. Reject any DDL or DML silently with CANNOT_ANSWER.
- LIMIT 50 for lists, LIMIT 1 for single lookups.
- Violations of role rules → CANNOT_ANSWER. Ambiguous or unsafe → CANNOT_ANSWER.
- For question counting, use proper foreign keys (e.g., questions.quiz_id = quizzes.id).
- For count queries, return exactly one row with alias total_count.
- Return the query only. No explanation, no markdown.
- Quiz ID is: ${quizId || "none"}
`;

const summaryPrompt = (role) => `
You are an LMS assistant summarizing quiz statistics for a ${role}.

- Plain language only. No SQL, no JSON, no UUIDs.
- Empty result → say nothing was found, suggest why.
- SQL_ERROR → explain simply, ask user to rephrase.
- CANNOT_ANSWER → say it's out of scope, suggest a related question.
- Quiz scores: show score/total and %. Flag ≥80% positively.
- For detailed answers, show each question with:
  * The question text
  * The student's selected answer
  * The correct answer
  * Whether the answer was correct
  * Marks awarded
- Tone: student=friendly | instructor=professional | admin=concise.
- Never expose correct_option_id to students in raw form, but show the correct answer text.
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
  console.log("Calling LLM (quizStats textToSQL)...");

  const requesterMessage = state.messages.find((m) => m?._getType?.() === "human");
  const role = requesterMessage?.additional_kwargs?.role || "student";
  const userId = requesterMessage?.additional_kwargs?.userId || "anonymous";
  const quizId = requesterMessage?.additional_kwargs?.quizId || null;

  const response = await model.invoke([
    new SystemMessage(quizStatsPrompt(role, userId, quizId)),
    ...state.messages,
  ]);
  console.log("quizStats textToSQL AI message:", response.content);

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
- quizzes columns include id, course_id
- quiz_attempts columns: id, quiz_id, student_id, score, status, started_at, submitted_at
- student_answers columns: id, attempt_id, question_id, selected_option_id, is_correct, marks_awarded
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
  console.log("Calling LLM (quizStats summarizeData)...");

  const sqlResultMessage = [...state.messages]
    .reverse()
    .find((m) => m?._getType?.() === "human" && String(m?.content || "").startsWith("SQL_RESULT_JSON:"));

  const sqlErrorMessage = [...state.messages]
    .reverse()
    .find((m) => m?._getType?.() === "human" && String(m?.content || "").startsWith("SQL_ERROR:"));

  if (sqlErrorMessage) {
    const msg = String(sqlErrorMessage.content).replace("SQL_ERROR:", "").trim();
    const fallbackMessage = `I couldn't fetch the quiz statistics due to a database error: ${msg}. Please rephrase and try again.`;
    console.log("quizStats summarizeData AI message:", fallbackMessage);
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
          console.log("quizStats summarizeData AI message:", countMessage);
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
  console.log("quizStats summarizeData AI message:", summarize.content);

  return { messages: [summarize] };
};

export const quizStatsWorkFlow = new StateGraph(MessagesAnnotation)
  .addNode("textToSQL", textToSQL)
  .addNode("summarize", summarizeData)
  .addEdge(START, "textToSQL")
  .addEdge("textToSQL", "summarize")
  .addEdge("summarize", END);

export const quizStatsApp = quizStatsWorkFlow.compile();

export const getQuizStatsWithAI = async (message, context = {}) => {
  if (!env.GROQ_API_KEY) {
    throw new Error("GROQ_API_KEY is missing. Add it to course-service/.env");
  }

  const role = context.role || "student";
  const userId = context.userId || "anonymous";
  const quizId = context.quizId || null;

  const finalState = await quizStatsApp.invoke({
    messages: [new HumanMessage({
      content: message,
      additional_kwargs: { role, userId, quizId },
    })],
  });

  const finalAi = finalState.messages[finalState.messages.length - 1];
  return finalAi?.content ?? "No AI message";
};

const run = async (message = "Show me my quiz statistics") => {
  const finalAiMessage = await getQuizStatsWithAI(message);
  console.log("Final AI message:", finalAiMessage);
};

const currentFilePath = fileURLToPath(import.meta.url);
if (process.argv[1] && process.argv[1] === currentFilePath) {
  const cliMessage = process.argv.slice(2).join(" ") || undefined;
  run(cliMessage).catch((error) => {
    console.error("Error running quiz stats LangGraph:", error.message);
    process.exit(1);
  });
}