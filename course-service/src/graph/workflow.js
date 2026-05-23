import { END, START, StateGraph } from "@langchain/langgraph";
import { createInitialState } from "./state.js";
import { routeQueryNode } from "./nodes/router.js";
import { generalQANode } from "./nodes/general_qa.js";
import { plannerNode } from "./nodes/planner.js";
import {
  errorHandlerNode,
  finalSummarizerNode,
  resultAggregationNode,
  schemaLoaderNode,
  sqlExecutionNode,
  sqlGenerationNode,
  sqlRepairNode,
  sqlValidationNode,
} from "./nodes/db_flow.js";
import {
  shouldContinueSteps,
  shouldFinishOrRetry,
  shouldGoGeneral,
  shouldRepairSql,
  shouldRetryExecution,
} from "./conditions.js";

export const chatbotWorkflow = new StateGraph({
  channels: {
    userQuery: null,
    queryType: null,
    errors: null,
    retryCount: null,
    planSteps: null,
    currentStepIndex: null,
    generatedSql: null,
    sqlValidation: null,
    executionResult: null,
    stepResults: null,
    finalAnswer: null,
    context: null,
    schemaContext: null,
  },
})
  .addNode("router", routeQueryNode)
  .addNode("general_qa", generalQANode)
  .addNode("planner", plannerNode)
  .addNode("schema_loader", schemaLoaderNode)
  .addNode("sql_generation", sqlGenerationNode)
  .addNode("sql_validation", sqlValidationNode)
  .addNode("sql_repair", sqlRepairNode)
  .addNode("sql_execution", sqlExecutionNode)
  .addNode("result_aggregation", resultAggregationNode)
  .addNode("final_summarizer", finalSummarizerNode)
  .addNode("error_handler", errorHandlerNode)
  .addEdge(START, "router")
  .addConditionalEdges("router", shouldGoGeneral, {
    general: "general_qa",
    database: "planner",
  })
  .addEdge("general_qa", END)
  .addEdge("planner", "schema_loader")
  .addEdge("schema_loader", "sql_generation")
  .addEdge("sql_generation", "sql_validation")
  .addConditionalEdges("sql_validation", shouldRepairSql, {
    execute: "sql_execution",
    repair: "sql_repair",
    error: "error_handler",
  })
  .addEdge("sql_repair", "sql_validation")
  .addConditionalEdges("sql_execution", shouldRetryExecution, {
    aggregate: "result_aggregation",
    repair: "sql_repair",
    error: "error_handler",
  })
  .addConditionalEdges("result_aggregation", shouldContinueSteps, {
    continue: "sql_generation",
    summarize: "final_summarizer",
  })
  .addEdge("final_summarizer", END)
  .addConditionalEdges("error_handler", shouldFinishOrRetry, {
    finish: END,
    retry: "sql_generation",
  });

export const chatbotGraphApp = chatbotWorkflow.compile();

export const askCourseAI = async (message, context = {}) => {
  const finalState = await chatbotGraphApp.invoke(createInitialState(message, context));
  return finalState.finalAnswer || "I could not generate a response.";
};

export const workflowConditions = {
  shouldGoGeneral,
  shouldRepairSql,
  shouldContinueSteps,
  shouldRetryExecution,
  shouldFinishOrRetry,
};
