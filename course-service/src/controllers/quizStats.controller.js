import asyncHandler from "../utils/async-handler.js";
import { getQuizStatsWithAI } from "../services/quizStatsLangGraph.js";
import pool from "../config/db.config.js";

// Helper function to extract user ID from JWT token
const getUserIdFromToken = (req) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return null;
        }
        const token = authHeader.split(' ')[1];
        const payload = JSON.parse(atob(token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')));
        return payload?.sub || null;
    } catch {
        return null;
    }
};

export const getQuizStatistics = asyncHandler(async (req, res) => {
    const quizId = req.params.quiz_id;
    // Try to get user ID from header first, then from JWT token
    let userId = req.headers['x-user-id'];
    if (!userId) {
        userId = getUserIdFromToken(req);
    }
    const role = req.headers['x-user-role'] || 'student';

    if (!quizId) {
        return res.status(400).json({ success: false, message: "quiz_id is required" });
    }
    if (!userId) {
        return res.status(401).json({ success: false, message: "Unauthorized - Please log in again" });
    }

    try {
        // Get quiz details
        const quizResult = await pool.query(
            `SELECT q.*, c.title as course_title 
             FROM quizzes q 
             JOIN course c ON q.course_id = c.id 
             WHERE q.id = $1`,
            [quizId]
        );

        if (quizResult.rows.length === 0) {
            return res.status(404).json({ success: false, message: "Quiz not found" });
        }

        const quiz = quizResult.rows[0];

        // Get student's attempt (get the most recent one regardless of status)
        const attemptResult = await pool.query(
            `SELECT * FROM quiz_attempts 
             WHERE quiz_id = $1 AND student_id = $2
             ORDER BY started_at DESC LIMIT 1`,
            [quizId, userId]
        );

        if (attemptResult.rows.length === 0) {
            return res.status(404).json({ 
                success: false, 
                message: "No attempt found for this quiz. Please take the quiz first." 
            });
        }

        const attempt = attemptResult.rows[0];
        
        // Check if attempt is submitted
        if (attempt.status !== 'submitted') {
            return res.status(400).json({ 
                success: false, 
                message: attempt.status === 'in_progress' 
                    ? "Quiz attempt is still in progress. Please complete and submit the quiz first."
                    : "Quiz attempt has not been submitted yet.",
                attempt_status: attempt.status
            });
        }

        // attempt already defined above

        // Get student's answers with question details
        const answersResult = await pool.query(
            `SELECT 
                sa.id as answer_id,
                sa.question_id,
                sa.selected_option_id,
                sa.is_correct,
                sa.marks_awarded,
                q.question_text,
                q.options,
                q.correct_option_id,
                q.marks as total_marks
             FROM student_answers sa
             JOIN questions q ON sa.question_id = q.id
             WHERE sa.attempt_id = $1
             ORDER BY q.id`,
            [attempt.id]
        );

        // Get quiz statistics using LangGraph
        const aiPrompt = `Get detailed statistics for quiz ${quizId} for student ${userId}. 
        Show my score, percentage, and for each question: the question text, my selected answer, the correct answer, whether I was correct, and marks awarded.`;
        
        let aiSummary = "";
        try {
            aiSummary = await getQuizStatsWithAI(aiPrompt, {
                role: role,
                userId: userId,
                quizId: quizId
            });
        } catch (aiError) {
            console.error("AI summary error:", aiError);
            aiSummary = "Unable to generate AI summary at this time.";
        }

        // Format the response
        const formattedAnswers = answersResult.rows.map(answer => {
            const options = Array.isArray(answer.options) ? answer.options : 
                (typeof answer.options === 'string' ? JSON.parse(answer.options) : []);
            
            const selectedOption = options.find(opt => 
                opt.id === answer.selected_option_id || opt.option_id === answer.selected_option_id
            );
            const correctOption = options.find(opt => 
                opt.id === answer.correct_option_id || opt.option_id === answer.correct_option_id
            );

            return {
                question_id: answer.question_id,
                question_text: answer.question_text,
                selected_option_id: answer.selected_option_id,
                selected_answer: selectedOption?.text || selectedOption?.label || answer.selected_option_id,
                correct_option_id: answer.correct_option_id,
                correct_answer: correctOption?.text || correctOption?.label || answer.correct_option_id,
                is_correct: answer.is_correct,
                marks_awarded: answer.marks_awarded,
                total_marks: answer.total_marks
            };
        });

        const totalQuestions = formattedAnswers.length;
        const correctAnswers = formattedAnswers.filter(a => a.is_correct).length;
        const percentage = totalQuestions > 0 ? Math.round((attempt.score / quiz.total_marks) * 100) : 0;

        res.status(200).json({
            success: true,
            data: {
                quiz: {
                    id: quiz.id,
                    title: quiz.title,
                    course_title: quiz.course_title,
                    total_marks: quiz.total_marks,
                    time_limit: quiz.time_limit
                },
                attempt: {
                    id: attempt.id,
                    score: attempt.score,
                    submitted_at: attempt.submitted_at,
                    started_at: attempt.started_at
                },
                statistics: {
                    total_questions: totalQuestions,
                    correct_answers: correctAnswers,
                    wrong_answers: totalQuestions - correctAnswers,
                    percentage: percentage,
                    total_marks_obtained: attempt.score,
                    total_marks_available: quiz.total_marks
                },
                answers: formattedAnswers,
                ai_summary: aiSummary
            }
        });

    } catch (error) {
        console.error("Error getting quiz statistics:", error);
        res.status(500).json({ 
            success: false, 
            message: "Failed to retrieve quiz statistics",
            error: error.message 
        });
    }
});

export const getQuizDetailedAnswers = asyncHandler(async (req, res) => {
    const quizId = req.params.quiz_id;
    // Try to get user ID from header first, then from JWT token
    let userId = req.headers['x-user-id'];
    if (!userId) {
        userId = getUserIdFromToken(req);
    }
    const role = req.headers['x-user-role'] || 'student';

    if (!quizId) {
        return res.status(400).json({ success: false, message: "quiz_id is required" });
    }
    if (!userId) {
        return res.status(401).json({ success: false, message: "Unauthorized - Please log in again" });
    }

    try {
        // Get student's latest submitted attempt
        const attemptResult = await pool.query(
            `SELECT * FROM quiz_attempts 
             WHERE quiz_id = $1 AND student_id = $2 AND status = 'submitted'
             ORDER BY submitted_at DESC LIMIT 1`,
            [quizId, userId]
        );

        if (attemptResult.rows.length === 0) {
            return res.status(404).json({ 
                success: false, 
                message: "No submitted attempt found for this quiz" 
            });
        }

        const attempt = attemptResult.rows[0];

        // Get detailed answers using LangGraph
        const aiPrompt = `Get detailed question-by-question breakdown for quiz ${quizId} attempt ${attempt.id}. 
        For each question show: question text, all options, my selected answer, correct answer, 
        whether I was correct, and marks awarded vs total marks.`;
        
        let aiResponse = "";
        try {
            aiResponse = await getQuizStatsWithAI(aiPrompt, {
                role: role,
                userId: userId,
                quizId: quizId
            });
        } catch (aiError) {
            console.error("AI response error:", aiError);
            aiResponse = "Unable to generate detailed breakdown at this time.";
        }

        // Get raw data as backup
        const detailedResult = await pool.query(
            `SELECT 
                q.question_text,
                q.options,
                q.correct_option_id,
                q.marks as question_marks,
                sa.selected_option_id,
                sa.is_correct,
                sa.marks_awarded
             FROM student_answers sa
             JOIN questions q ON sa.question_id = q.id
             WHERE sa.attempt_id = $1
             ORDER BY q.id`,
            [attempt.id]
        );

        res.status(200).json({
            success: true,
            data: {
                attempt_id: attempt.id,
                quiz_id: quizId,
                ai_breakdown: aiResponse,
                detailed_answers: detailedResult.rows
            }
        });

    } catch (error) {
        console.error("Error getting detailed answers:", error);
        res.status(500).json({ 
            success: false, 
            message: "Failed to retrieve detailed answers",
            error: error.message 
        });
    }
});