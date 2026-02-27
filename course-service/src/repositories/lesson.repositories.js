import axios from "axios";
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

export const deleteQuizQuestionRepository = async ({ question_id }) => {
    return pool.query(
        `DELETE FROM questions WHERE id = $1 RETURNING id`,
        [question_id]
    );
};

export const getQuizByIdRepository = async ({ quiz_id }) => {
    return pool.query(
        `SELECT *
        FROM quizzes
        WHERE id = $1`,
        [quiz_id]
    );
};

export const getQuestionsByQuizIdRepository = async ({ quiz_id }) => {
    return pool.query(
        `SELECT q.id, q.question_text, q.options, q.correct_option_id, q.marks, z.course_id
        FROM questions q
        JOIN quizzes z ON z.id = q.quiz_id
        WHERE q.quiz_id = $1`,
        [quiz_id]
    );
};


export const checkQuizBelongsToCourseRepository = async ({ quiz_id, course_id }) => {
    return pool.query(
        `SELECT 1 FROM quizzes WHERE id = $1 AND course_id = $2`,
        [quiz_id, course_id]
    );
}

export const startQuizAttemptRepository = async ({ quiz_id, user_id }) => {
   

    return pool.query(
        `INSERT INTO quiz_attempts (quiz_id, student_id)
        VALUES ($1, $2)
        RETURNING *`,
        [quiz_id, user_id]
    );
    
}
export const getQuizAttemptByIdRepository = async ({ attempt_id }) => {
    return pool.query(
        `SELECT * FROM quiz_attempts WHERE id = $1`,
        [attempt_id]
    );
}
//export const submitQuizAttemptRepository = async ({ attempt_id, score, answers }) => {

export const getUserEnrolledCoursesRepository = async ({ course_id }) => {
    const result = axios.get(`${process.env.ENROLLMENT_SERVICE_URL}/enrollments/enrolled/${course_id}`, {
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${process.env.ENROLLMENT_SERVICE_API_KEY}`
        }
    });
    return result;

}

export const submitQuizAttemptRepository = async ({ attempt_id, studentAnswers, totalScore }) => {
    await beginLessonTransactionRepository();
    try{
        console.log("transaction started for submitting quiz attempt");
        console.log("Received student answers for attempt_id", attempt_id, studentAnswers);

        if (studentAnswers.length === 0) {
            await rollbackLessonTransactionRepository();
            return { success: false, message: "No answers provided" };

        }
        const insertAnswers = await pool.query(
            `INSERT INTO student_answers (attempt_id, question_id, selected_option_id, is_correct, marks_awarded) 
            VALUES ${studentAnswers.map((_, index) => `($${index * 5 + 1}, $${index * 5 + 2}, $${index * 5 + 3}, $${index * 5 + 4}, $${index * 5 + 5})`).join(", ")}`,
            studentAnswers.flatMap(ans => [ans.attempt_id, ans.question_id, ans.selected_option_id, ans.is_correct, ans.marks_awarded])
        );

        if (insertAnswers.rowCount === 0) {
            await rollbackLessonTransactionRepository();
            return { success: false, message: "Failed to save quiz answers" };
        }
        const result = await pool.query(
            `UPDATE quiz_attempts SET score =  $1, status = 'submitted', submitted_at = NOW() WHERE id = $2 RETURNING *`,
            [totalScore, attempt_id]
        );
        if(result.rowCount === 0) {
            await rollbackLessonTransactionRepository();
            return { success: false, message: "Failed to update quiz attempt with score" };
        }

        console.log("Quiz answers inserted successfully, now committing transaction");
        await commitLessonTransactionRepository();
        return { success: true, message: "Quiz answers submitted successfully", data: result.rows[0] };
    } catch (error) {
        console.error("Error submitting quiz attempt:", error);
        await rollbackLessonTransactionRepository();
        throw error;
    }
};