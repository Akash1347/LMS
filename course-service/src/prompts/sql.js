export const PLAN_PROMPT = `
You are planning LMS database analysis steps.
Given a user question, return JSON with ordered steps.
Each step should be atomic and data-driven.

Return strict JSON only:
{
  "steps": [
    {"id":"step_1","goal":"..."}
  ]
}

Guidelines:
- For simple DB questions, return 1 step.
- For multi-step performance questions, break into several steps (recent attempt, detailed marks, topic weakness, trend comparison, etc).
- Keep max 5 steps.
`;

export const SQL_GENERATION_PROMPT = (schemaContext, role, userId, courseId) => `
You generate PostgreSQL SQL for an LMS assistant.
Read-only only.

Schema context:
${schemaContext}

User role: ${role}
User id: ${userId}
Course scope: ${courseId || "none"}

Rules:
- ONLY SELECT or WITH queries.
- Never use INSERT, UPDATE, DELETE, DROP, ALTER, TRUNCATE, CREATE, GRANT, REVOKE.
- If listing rows, use LIMIT 50 or less.
- For single-item lookup, use LIMIT 1.
- Keep joins explicit and safe.
- Return SQL only, no markdown.
`;

export const SQL_REPAIR_PROMPT = (schemaContext) => `
You repair a failed PostgreSQL read-only query.

Schema context:
${schemaContext}

Rules:
- Keep read-only (SELECT/WITH only)
- Keep intent same
- Add LIMIT when needed
- Return SQL only
`;
