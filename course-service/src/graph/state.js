/**
 * @typedef {"general" | "database"} QueryType
 */

/**
 * @typedef {Object} PlanStep
 * @property {string} id
 * @property {string} goal
 * @property {string} [sql]
 * @property {Array<Record<string, unknown>>} [result]
 */

/**
 * @typedef {Object} ChatbotState
 * @property {string} userQuery
 * @property {QueryType | null} queryType
 * @property {string[]} errors
 * @property {number} retryCount
 * @property {PlanStep[]} planSteps
 * @property {number} currentStepIndex
 * @property {string | null} generatedSql
 * @property {{isValid: boolean, reason?: string, repairedSql?: string} | null} sqlValidation
 * @property {Array<Record<string, unknown>> | null} executionResult
 * @property {Array<{stepId: string, rows: Array<Record<string, unknown>>}>} stepResults
 * @property {string | null} finalAnswer
 * @property {{role: string, userId: string, courseId: string | null}} context
 */

export const createInitialState = (userQuery, context = {}) => ({
  userQuery,
  queryType: null,
  errors: [],
  retryCount: 0,
  planSteps: [],
  currentStepIndex: 0,
  generatedSql: null,
  sqlValidation: null,
  executionResult: null,
  stepResults: [],
  finalAnswer: null,
  context: {
    role: context.role || "student",
    userId: context.userId || "anonymous",
    courseId: context.courseId || null,
  },
});
