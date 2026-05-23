import test from "node:test";
import assert from "node:assert/strict";
import { createInitialState } from "../src/graph/state.js";
import { buildStepSummaryInput } from "../src/services/analyzer.js";

test("initial state has expected shape", () => {
  const state = createInitialState("compare my last 3 exams", {
    role: "student",
    userId: "u1",
    courseId: "c1",
  });

  assert.equal(state.userQuery, "compare my last 3 exams");
  assert.equal(state.context.role, "student");
  assert.equal(state.context.userId, "u1");
  assert.equal(state.context.courseId, "c1");
  assert.deepEqual(state.planSteps, []);
  assert.deepEqual(state.stepResults, []);
  assert.equal(state.finalAnswer, null);
});

test("summary input shape is stable and parseable", () => {
  const summaryInput = buildStepSummaryInput(
    "which topics do i need to improve",
    [{ id: "step_1", goal: "fetch wrong answers" }],
    [{ stepId: "step_1", rows: [{ question_text: "Q1", is_correct: false }] }],
  );

  const parsed = JSON.parse(summaryInput);
  assert.equal(typeof parsed.userQuery, "string");
  assert.equal(Array.isArray(parsed.planSteps), true);
  assert.equal(Array.isArray(parsed.stepResults), true);
  assert.equal(parsed.stepResults[0].stepId, "step_1");
});

test("multi-step state progression contract", () => {
  const state = createInitialState("my performance from my last exam");
  state.planSteps = [
    { id: "step_1", goal: "get latest attempt" },
    { id: "step_2", goal: "get question-level results" },
  ];

  state.currentStepIndex = 0;
  state.stepResults.push({ stepId: "step_1", rows: [{ attempt_id: "a1" }] });
  state.currentStepIndex = 1;
  state.stepResults.push({ stepId: "step_2", rows: [{ topic: "algebra", score: 2 }] });

  assert.equal(state.stepResults.length, 2);
  assert.equal(state.stepResults[1].stepId, "step_2");
});
