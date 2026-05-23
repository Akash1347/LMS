import test from "node:test";
import assert from "node:assert/strict";
import { validateReadOnlySql } from "../src/services/sql_validator.js";

test("allows SELECT and injects LIMIT when missing", () => {
  const result = validateReadOnlySql("SELECT * FROM quizzes");
  assert.equal(result.isValid, true);
  assert.match(result.repairedSql, /limit\s+50/i);
});

test("blocks unsafe SQL statements", () => {
  const result = validateReadOnlySql("DELETE FROM quizzes WHERE id='1'");
  assert.equal(result.isValid, false);
  assert.match(result.reason, /unsafe/i);
});

test("blocks non-select SQL", () => {
  const result = validateReadOnlySql("VACUUM");
  assert.equal(result.isValid, false);
  assert.match(result.reason, /select\/with/i);
});
