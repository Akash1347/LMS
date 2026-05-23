const WRITE_KEYWORDS = [
  "insert",
  "update",
  "delete",
  "drop",
  "alter",
  "truncate",
  "create",
  "grant",
  "revoke",
  "comment",
];

const hasUnsafeKeyword = (sql) => {
  const lowered = sql.toLowerCase();
  return WRITE_KEYWORDS.some((keyword) => new RegExp(`\\b${keyword}\\b`, "i").test(lowered));
};

const startsReadOnly = (sql) => /^\s*(select|with)\b/i.test(sql);

const hasLimitClause = (sql) => /\blimit\s+\d+\b/i.test(sql);

const appendDefaultLimit = (sql, defaultLimit = 50) => {
  const trimmed = sql.trim().replace(/;$/, "");
  if (hasLimitClause(trimmed)) return trimmed;
  return `${trimmed} LIMIT ${defaultLimit}`;
};

export const validateReadOnlySql = (sql) => {
  if (!sql || !String(sql).trim()) {
    return { isValid: false, reason: "Empty SQL query" };
  }

  const normalized = String(sql).trim();

  if (hasUnsafeKeyword(normalized)) {
    return { isValid: false, reason: "Unsafe SQL keyword detected" };
  }

  if (!startsReadOnly(normalized)) {
    return { isValid: false, reason: "Only SELECT/WITH queries are allowed" };
  }

  return {
    isValid: true,
    repairedSql: appendDefaultLimit(normalized),
  };
};
