import test from "node:test";
import assert from "node:assert/strict";
import {
  shouldContinueSteps,
  shouldFinishOrRetry,
  shouldGoGeneral,
  shouldRepairSql,
  shouldRetryExecution,
} from "../src/graph/conditions.js";

test("routes general query path", () => {
  assert.equal(shouldGoGeneral({ queryType: "general" }), "general");
});

test("routes database query path by default", () => {
  assert.equal(shouldGoGeneral({ queryType: "database" }), "database");
  assert.equal(shouldGoGeneral({ queryType: null }), "database");
});

test("sql validation branch selects execute or repair/error", () => {
  assert.equal(shouldRepairSql({ sqlValidation: { isValid: true }, retryCount: 0 }), "execute");
  assert.equal(shouldRepairSql({ sqlValidation: { isValid: false }, retryCount: 0 }), "repair");
  assert.equal(shouldRepairSql({ sqlValidation: { isValid: false }, retryCount: 2 }), "error");
});

test("step continuation branch works", () => {
  assert.equal(shouldContinueSteps({ currentStepIndex: 0, planSteps: [{}, {}] }), "continue");
  assert.equal(shouldContinueSteps({ currentStepIndex: 1, planSteps: [{}, {}] }), "summarize");
});

test("execution retry and finish branch works", () => {
  assert.equal(shouldRetryExecution({ errors: [], retryCount: 0 }), "aggregate");
  assert.equal(shouldRetryExecution({ errors: ["x"], retryCount: 1 }), "repair");
  assert.equal(shouldRetryExecution({ errors: ["x"], retryCount: 2 }), "error");

  assert.equal(shouldFinishOrRetry({ finalAnswer: "done" }), "finish");
  assert.equal(shouldFinishOrRetry({ finalAnswer: null }), "retry");
});
