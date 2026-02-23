import pool from "../config/db.js";

export const createLessonRepository = async ({ module_id, title, type, content_ref, order_index, publicId }) => {
    return pool.query(
        `
        INSERT INTO lesson (module_id, title, type, content_ref, order_index, public_id)
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING *
        `,
        [module_id, title, type, content_ref, order_index, publicId]
    );
};

export const deleteLessonRepository = async ({ instructorId, lesson_id }) => {
    return pool.query(
        `DELETE FROM lesson l
        USING module m, course c
        WHERE l.module_id = m.id
        AND m.course_id = c.id
        AND c.instructor_id = $1
        AND l.id = $2
        RETURNING l.id`,
        [instructorId, lesson_id]
    );
};

export const getLessonsByModuleIdRepository = async ({ module_id }) => {
    return pool.query(
        `SELECT id, title, type, content_ref, order_index
        FROM lesson
        WHERE module_id = $1
        ORDER BY order_index ASC`,
        [module_id]
    );
};

export const checkLessonOrderExistsRepository = async ({ module_id, order_index }) => {
    return pool.query(
        `SELECT id FROM lesson WHERE module_id = $1 AND order_index = $2 LIMIT 1`,
        [module_id, order_index]
    );
};

export const checkInstructorCanCreateQuizRepository = async ({ course_id, instructorId }) => {
    return pool.query(`SELECT 1 FROM course WHERE id = $1 AND instructor_id = $2`, [course_id, instructorId]);
};

export const beginLessonTransactionRepository = async () => pool.query("BEGIN");
export const commitLessonTransactionRepository = async () => pool.query("COMMIT");
export const rollbackLessonTransactionRepository = async () => pool.query("ROLLBACK");

export const createQuizRepository = async ({ course_id, title, description, time_limit, total_marks }) => {
    return pool.query(
        `INSERT INTO quizzes (course_id, title, description, time_limit, total_marks)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING *`,
        [course_id, title, description || "", time_limit || null, total_marks || 0]
    );
};

export const editQuizRepository = async ({ quiz_id, title, description, time_limit, total_marks }) => {
    return pool.query(
        `UPDATE quizzes SET
         title = COALESCE($1, title),
         description = COALESCE($2, description),
         time_limit = COALESCE($3, time_limit),
         total_marks = COALESCE($4, total_marks)
         WHERE id = $5
         RETURNING *`,
        [title, description, time_limit, total_marks, quiz_id]
    );
};

export const createQuestionsBulkRepository = async ({ quizId, questions }) => {
    const questionValues = [];
    const questionPlaceholders = [];

    questions.forEach((q, index) => {
        let parsedOptions = q.options || [];

        if (typeof parsedOptions === "string") {
            try {
                parsedOptions = JSON.parse(parsedOptions);
            } catch (_err) {
                throw new Error(`Invalid JSON format for options at question index ${index}`);
            }
        }

        const correctOptionId = q.correct_option_id || q.correct_answer_id || q.correct_answer;

        if (!correctOptionId) {
            throw new Error(`correct_option_id (or correct_answer_id) is required at question index ${index}`);
        }

        const baseIndex = index * 5;
        questionPlaceholders.push(
            `($${baseIndex + 1}, $${baseIndex + 2}, $${baseIndex + 3}, $${baseIndex + 4}, $${baseIndex + 5})`
        );

        questionValues.push(
            quizId,
            q.question_text,
            JSON.stringify(parsedOptions),
            correctOptionId,
            q.marks || 0
        );
    });

    if (questionValues.length === 0) return;

    return pool.query(
        `INSERT INTO questions (quiz_id, question_text, options, correct_option_id, marks)
        VALUES ${questionPlaceholders.join(", ")}`,
        questionValues
    );
};

export const createQuizLessonMappingRepository = async ({ module_id, title, type, quizContentRef, time_limit, order_index }) => {
    return pool.query(
        `INSERT INTO lesson (module_id, title, type, content_ref, duration_seconds, order_index, public_id)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        RETURNING *`,
        [module_id, title, type, quizContentRef, time_limit * 60, order_index, "quiz"]
    );
};

export const editQuizQuestionRepository = async ({ question_id, question_text, options, correct_option_id, marks }) => {
    return pool.query(
        `UPDATE questions SET
        question_text = COALESCE($1, question_text),
        options = COALESCE($2, options),    
        correct_option_id = COALESCE($3, correct_option_id),
        marks = COALESCE($4, marks)
        WHERE id = $5
        RETURNING *`,
        [question_text, options ? JSON.stringify(options) : null, correct_option_id, marks, question_id]
    );

};

export const deleteQuizRepository = async ({ quiz_id }) => {
    return pool.query(
        `DELETE FROM quizzes WHERE id = $1 RETURNING id`,
        [quiz_id]
    );
};

export const deleteQuizQuestionRepository = async( { question_id }) => {
    return pool.query(
        `DELETE FROM questions WHERE id = $1 RETURNING id`,
        [question_id]
    );
};

export const getQuizByIdRepository = async ({ quiz_id }) => {
    return pool.query(
        `SELECT id, course_id, title, description, time_limit, total_marks
        FROM quizzes
        WHERE id = $1`,
        [quiz_id]
        );
};

export const getQuestionsByQuizIdRepository = async ({ quiz_id }) => {
    return pool.query(
        `SELECT id, question_text, options, correct_option_id, marks
        FROM questions
        WHERE quiz_id = $1`,
        [quiz_id]
    );
};