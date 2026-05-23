import env from "../config/env.config.js";
import { askCourseAI as askCourseAIFromWorkflow } from "../graph/workflow.js";

export const askCourseAI = async (message, context = {}) => {
  if (!env.GROQ_API_KEY) {
    throw new Error("GROQ_API_KEY is missing. Add it to course-service/.env");
  }

  return askCourseAIFromWorkflow(message, context);
};
