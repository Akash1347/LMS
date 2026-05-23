import env from "../../config/env.config.js";
import { ChatGroq } from "@langchain/groq";

export const createModel = () =>
  new ChatGroq({
    apiKey: env.GROQ_API_KEY,
    model: env.GROQ_MODEL || "llama-3.3-70b-versatile",
    temperature: 0,
    maxRetries: 2,
  });

export const safeJsonParse = (value, fallback) => {
  try {
    return JSON.parse(value);
  } catch {
    return fallback;
  }
};

export const extractSql = (text = "") => {
  const fenced = text.match(/```sql\s*([\s\S]*?)```/i);
  if (fenced?.[1]) return fenced[1].trim();
  return String(text).trim();
};
