export const buildStepSummaryInput = (userQuery, planSteps, stepResults) => {
  return JSON.stringify(
    {
      userQuery,
      planSteps,
      stepResults,
    },
    null,
    2,
  );
};

export const getRelevantSchemaContext = (query) => {
  const q = String(query || "").toLowerCase();

  const baseTables = [
    "course(id, title, instructor_id, status, category, level, price, currency)",
    "quizzes(id, course_id, title, total_marks, is_published)",
    "quiz_attempts(id, quiz_id, student_id, score, status, started_at, submitted_at)",
    "questions(id, quiz_id, question_text, marks, options, correct_option_id)",
    "student_answers(id, attempt_id, question_id, selected_option_id, is_correct, marks_awarded)",
  ];

  if (/topic|weak|improve|incorrect|question/.test(q)) {
    return baseTables.join("\n");
  }

  if (/course|price|category/.test(q)) {
    return [baseTables[0], baseTables[1], baseTables[2]].join("\n");
  }

  return [baseTables[1], baseTables[2]].join("\n");
};
