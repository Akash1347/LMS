import asyncHandler from "../utils/async-handler.js";
import { getQuizByIdRepository, checkQuizBelongsToCourseRepository, startQuizAttemptRepository, 
    getQuestionsByQuizIdRepository, getQuizAttemptByIdRepository, submitQuizAttemptRepository } from "../repositories/lesson.repositories.js";
import { getUserEnrolledCoursesRepository } from "../repositories/course.repositories.js";

export const startQuiz = asyncHandler(async (req, res) => {

    const quiz_id = req.params.quiz_id;
    const user_id = req.user.sub;
    const course_id = req.params.course_id;
    const authorization = req.headers.authorization;
    if (!quiz_id) {
        return res.status(400).json({ success: false, message: "quiz_id is required" });
    }
    if (!course_id) {
        return res.status(400).json({ success: false, message: "course_id is required" });
    }
    if (!user_id) {
        return res.status(400).json({ success: false, message: "user_id is required" });
    }
    if (!authorization) {
        return res.status(401).json({ success: false, message: "Authorization header missing" });
    }

    const getQuizData = await getQuizByIdRepository({ quiz_id });
    if (getQuizData.rowCount === 0) {
        return res.status(404).json({ success: false, message: "Quiz not found" });
    }
    const quiz = getQuizData.rows[0];
    const now = new Date();

    const startTime = quiz.attempt_start_time
        ? new Date(quiz.attempt_start_time)
        : null;

    const endTime = quiz.attempt_end_time
        ? new Date(quiz.attempt_end_time)
        : null;

    if (
        (startTime && now < startTime) ||
        (endTime && now > endTime)
    ) {
        return res.status(400).json({
            success: false,
            message: "Quiz is not available in the current time window"
        });
    }
    if (
        (startTime && now < startTime) ||
        (endTime && now > endTime)
    ) {
        return res.status(400).json({
            success: false,
            message: "Quiz is not available in the current time window"
        });
    }

    const checkQuizBelongsToCourse = await checkQuizBelongsToCourseRepository({ quiz_id, course_id });
    if (checkQuizBelongsToCourse.rowCount === 0) {
        return res.status(403).json({ success: false, message: "Quiz does not belong to the course" });
    }

    let isUserEnrolled = false;
    try {
        isUserEnrolled = await getUserEnrolledCoursesRepository({ authorization, course_id });
    } catch (error) {
        const status = error?.response?.status;
        if (status === 401 || status === 403) {
            return res.status(403).json({ success: false, message: "Unable to verify enrollment with provided token" });
        }
        return res.status(503).json({ success: false, message: "Enrollment service unavailable" });
    }

    if (!isUserEnrolled) {
        return res.status(403).json({ success: false, message: "User is not enrolled in the course" });
    }

    const questions = await getQuestionsByQuizIdRepository({ quiz_id });
    if (questions.rowCount === 0) {
        return res.status(404).json({ success: false, message: "Quiz not found or has no questions" });
    }

    let startQuizAttempt;
    try {
        startQuizAttempt = await startQuizAttemptRepository({ quiz_id, user_id });
    } catch (error) {
        if (error?.code === "23505") {
            return res.status(409).json({ success: false, message: "Quiz attempt already exists for this user" });
        }
        throw error;
    }

    if (startQuizAttempt.rowCount === 0) {
        return res.status(500).json({ success: false, message: "Failed to start quiz attempt" });
    }

    res.status(200).json({ success: true, data: { attempt: startQuizAttempt.rows[0], questions: questions.rows } });

});


export const submitQuiz = asyncHandler(async(req, res) => {
    
    const user_id = req.user.sub;
    const attempt_id = req.params.attempt_id;

    const answer = req.body.answer;
    console.log("Received request to submit quiz attempt with attempt_id", attempt_id, "and answer", answer);
    if (!answer || Object.keys(answer).length === 0) {
        return res.status(400).json({ success: false, message: "Answer is required" });
    }
    const getAttemptData = await getQuizAttemptByIdRepository({ attempt_id });
    if (getAttemptData.rowCount === 0) {
        return res.status(404).json({ success: false, message: "Quiz attempt not found" });
    }
    const quizQuestions = await getQuestionsByQuizIdRepository({ quiz_id: getAttemptData.rows[0].quiz_id });
    const getQuizAttempt = getAttemptData.rows[0];
    if (getQuizAttempt.student_id !== user_id) {
        return res.status(403).json({ success: false, message: "User is not authorized to submit this quiz attempt" });
    }
    if(getQuizAttempt.status === "submitted") {
        return res.status(400).json({ success: false, message: "Quiz attempt has already been submitted" });
    }
    const studentAnswers = [];
    let totalScore = 0;
    quizQuestions.rows.forEach((question) => {
        const questionId = question.id;
        const allcatedMarks = question.marks;
        const correctOptionId = question.correct_option_id;
        const studentOptionId = answer[questionId];
        const isCorrect = studentOptionId === correctOptionId;
        studentAnswers.push({
            attempt_id,
            question_id: questionId,
            selected_option_id: studentOptionId,
            is_correct: isCorrect,
            marks_awarded: isCorrect ? allcatedMarks : 0,
        });
        if (isCorrect) {
            totalScore += allcatedMarks;
        }
    });
    console.log("Calculated total score for quiz attempt:", totalScore);

    const submitQuizAttempt = await submitQuizAttemptRepository({ attempt_id, studentAnswers, totalScore });

     
    res.status(200).json({ success: true, data: { studentAnswers, totalScore } });

})
