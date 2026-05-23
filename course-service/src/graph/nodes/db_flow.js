import { HumanMessage, SystemMessage } from "@langchain/core/messages";
import { SQL_GENERATION_PROMPT, SQL_REPAIR_PROMPT } from "../../prompts/sql.js";
import { SUMMARY_PROMPT } from "../../prompts/summarizer.js";
import { getRelevantSchemaContext, buildStepSummaryInput } from "../../services/analyzer.js";
import { validateReadOnlySql } from "../../services/sql_validator.js";
import { executeSql } from "../../services/sql_executor.js";
import { createModel, extractSql } from "./model.js";

export const schemaLoaderNode = async (state) => {
  const schemaContext = getRelevantSchemaContext(state.userQuery);
  return { ...state, schemaContext };
};

export const sqlGenerationNode = async (state) => {
  const currentStep = state.planSteps[state.currentStepIndex];
  if (!currentStep) return state;

  const model = createModel();
  const prompt = SQL_GENERATION_PROMPT(
    state.schemaContext,
    state.context.role,
    state.context.userId,
    state.context.courseId,
  );

  const response = await model.invoke([
    new SystemMessage(prompt),
    new HumanMessage(
      `User question: ${state.userQuery}\nCurrent step: ${currentStep.goal}\nPrevious step results: ${JSON.stringify(state.stepResults)}`,
    ),
  ]);

  return { ...state, generatedSql: extractSql(response.content) };
};

export const sqlValidationNode = async (state) => {
  const validation = validateReadOnlySql(state.generatedSql);
  return {
    ...state,
    sqlValidation: validation,
    generatedSql: validation?.repairedSql || state.generatedSql,
  };
};

export const sqlRepairNode = async (state) => {
  const model = createModel();
  const response = await model.invoke([
    new SystemMessage(SQL_REPAIR_PROMPT(state.schemaContext)),
    new HumanMessage(
      `Fix this SQL for step: ${state.planSteps[state.currentStepIndex]?.goal}\nSQL: ${state.generatedSql}\nValidation reason: ${state.sqlValidation?.reason}`,
    ),
  ]);

  return {
    ...state,
    generatedSql: extractSql(response.content),
    retryCount: state.retryCount + 1,
  };
};

export const sqlExecutionNode = async (state) => {
  try {
    const rows = await executeSql(state.generatedSql);
    return {
      ...state,
      executionResult: rows,
      stepResults: [
        ...state.stepResults,
        {
          stepId: state.planSteps[state.currentStepIndex]?.id || `step_${state.currentStepIndex + 1}`,
          rows,
        },
      ],
    };
  } catch (error) {
    return {
      ...state,
      errors: [...state.errors, `SQL_EXECUTION_ERROR: ${error.message}`],
      retryCount: state.retryCount + 1,
    };
  }
};

export const resultAggregationNode = async (state) => {
  const hasNextStep = state.currentStepIndex < state.planSteps.length - 1;
  if (hasNextStep) {
    return {
      ...state,
      currentStepIndex: state.currentStepIndex + 1,
      generatedSql: null,
      sqlValidation: null,
      executionResult: null,
    };
  }

  return state;
};

export const finalSummarizerNode = async (state) => {
  const model = createModel();
  const response = await model.invoke([
    new SystemMessage(SUMMARY_PROMPT(state.context.role)),
    new HumanMessage(buildStepSummaryInput(state.userQuery, state.planSteps, state.stepResults)),
  ]);

  return {
    ...state,
    finalAnswer: String(response.content || "I could not summarize the result."),
  };
};

export const errorHandlerNode = async (state) => {
  if (state.retryCount >= 2) {
    return {
      ...state,
      finalAnswer:
        "I couldn’t complete that data request safely. Please rephrase your question with specific exam or quiz details.",
    };
  }

  return state;
};
