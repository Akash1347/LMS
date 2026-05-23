import { HumanMessage, SystemMessage } from "@langchain/core/messages";
import { PLAN_PROMPT } from "../../prompts/sql.js";
import { createModel, safeJsonParse } from "./model.js";

const fallbackPlan = (query) => {
  const normalized = String(query || "").toLowerCase();
  if (/last\s+3\s+exam|compare/.test(normalized)) {
    return {
      steps: [
        { id: "step_1", goal: "Get last 3 submitted quiz attempts for the student with scores and totals" },
      ],
    };
  }
  if (/improve|weak|topic/.test(normalized)) {
    return {
      steps: [
        { id: "step_1", goal: "Get recent incorrect answers with question text and marks" },
      ],
    };
  }
  return {
    steps: [{ id: "step_1", goal: "Fetch relevant LMS analytics data for this question" }],
  };
};

export const plannerNode = async (state) => {
  const model = createModel();
  const response = await model.invoke([
    new SystemMessage(PLAN_PROMPT),
    new HumanMessage(state.userQuery),
  ]);

  const parsed = safeJsonParse(String(response.content || ""), fallbackPlan(state.userQuery));
  const steps = Array.isArray(parsed?.steps) && parsed.steps.length > 0 ? parsed.steps.slice(0, 5) : fallbackPlan(state.userQuery).steps;

  return {
    ...state,
    planSteps: steps.map((step, index) => ({ id: step.id || `step_${index + 1}`, goal: step.goal || "Fetch data" })),
    currentStepIndex: 0,
  };
};
