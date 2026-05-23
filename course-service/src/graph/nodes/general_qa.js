import { HumanMessage, SystemMessage } from "@langchain/core/messages";
import { createModel } from "./model.js";

const GENERAL_QA_PROMPT = `
You are an LMS assistant.
Answer general questions directly and clearly.
If the question needs student-specific data, ask the user to request analytics details explicitly.
`;

export const generalQANode = async (state) => {
  const model = createModel();
  const response = await model.invoke([
    new SystemMessage(GENERAL_QA_PROMPT),
    new HumanMessage(state.userQuery),
  ]);

  return { ...state, finalAnswer: String(response.content || "") };
};
