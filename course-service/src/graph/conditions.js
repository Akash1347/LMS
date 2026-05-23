export const shouldGoGeneral = (state) =>
  state.queryType === "general" ? "general" : "database";

export const shouldRepairSql = (state) => {
  if (state.sqlValidation?.isValid) return "execute";
  if (state.retryCount >= 2) return "error";
  return "repair";
};

export const shouldContinueSteps = (state) =>
  state.currentStepIndex < state.planSteps.length - 1 ? "continue" : "summarize";

export const shouldRetryExecution = (state) => {
  if (!state.errors.length) return "aggregate";
  if (state.retryCount >= 2) return "error";
  return "repair";
};

export const shouldFinishOrRetry = (state) =>
  state.finalAnswer ? "finish" : "retry";
