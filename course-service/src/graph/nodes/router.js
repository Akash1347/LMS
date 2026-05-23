import { HumanMessage, SystemMessage } from "@langchain/core/messages";
import { ROUTER_PROMPT } from "../../prompts/router.js";
import { createModel, safeJsonParse } from "./model.js";

export const routeQueryNode = async (state) => {
  const model = createModel();
  const response = await model.invoke([
    new SystemMessage(ROUTER_PROMPT),
    new HumanMessage(state.userQuery),
  ]);

  const parsed = safeJsonParse(String(response.content || ""), { queryType: "database" });
  const queryType = parsed?.queryType === "general" ? "general" : "database";
  return { ...state, queryType };
};
