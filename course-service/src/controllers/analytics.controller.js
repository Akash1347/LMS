import asyncHandler from '../utils/async-handler.js';
import pool from '../config/db.js';

export const getInstructorCourse = asyncHandler(async (req, res) => {
    const instructorId = req.user.sub;

    const getCourse = await pool.query(
        `SELECT * FROM course WHERE instructor_id = $1`,
        [instructorId]
    );
    if (getCourse.rows.length === 0) {
        return res.status(404).json({ message: 'No courses found for this instructor' });
    }

    res.status(200).json(getCourse.rows);


});


export const getQuizAnalytics = asyncHandler(async (req, res) => {

    const quizId = req.params.quiz_id;
    //     console.log("Quiz ID:", quizId);

    // const debug = await pool.query("SELECT COUNT(*) FROM quiz_attempts");
    // console.log("Total rows in table:", debug.rows);

    const getQuizData = await pool.query(
        `SELECT * FROM quiz_attempts
        WHERE quiz_id = $1 AND status = 'submitted' ORDER BY score DESC, submitted_at DESC`,
        [quizId]

    )
    res.status(200).json(getQuizData.rows);
});

export const getDetailedQuizAnalytics = asyncHandler(async (req, res) => {

    const quizId = req.params.quiz_id;
    //     console.log("Quiz ID:", quizId);

    // const debug = await pool.query("SELECT COUNT(*) FROM quiz_attempts");
    // console.log("Total rows in table:", debug.rows);

    const stats = await pool.query(`
    SELECT 
        MAX(score) AS highest_score,
        MIN(score) AS lowest_score,
        AVG(score) AS average_score,
        COUNT(*) AS total_attempts
    FROM quiz_attempts
    WHERE quiz_id = $1 AND status = 'submitted'
`, [quizId]);
    const correctPerQuestion = await pool.query(`
    SELECT 
        sa.question_id,
        COUNT(*) AS correct_count
    FROM quiz_attempts qa
    JOIN student_answers sa ON qa.id = sa.attempt_id
    WHERE qa.quiz_id = $1
      AND qa.status = 'submitted'
      AND sa.is_correct = true
    GROUP BY sa.question_id
    ORDER BY sa.question_id
`, [quizId]);

    return res.status(200).json({
        stats: stats.rows[0],
        correct_per_question: correctPerQuestion.rows
    });

});
