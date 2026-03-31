import { requireRole } from "@akash1347/auth-lib";
import { requireAuth } from "../config/auth.config.js";
import { chatWithCourseAI, createCourse, deleteCourse, editCourse, getBulkCourseById, getCourseById, getCourses } from "../controllers/course.controller.js";
import { createModule, deleteModule, editModule, getModulesByCourseId } from "../controllers/module.controller.js";
import { createLesson, deleteLesson, getLessonsByModuleId,
    createQuiz, editQuiz, editQuizQuestion, deleteQuiz, 
    deleteQuizQuestion, getQuizById, getQuestionsByQuizId } from "../controllers/lesson.controller.js";

import { startQuiz, submitQuiz } from "../controllers/quiz.controller.js";
import { getInstructorCourse, getQuizAnalytics, getDetailedQuizAnalytics } from "../controllers/analytics.controller.js";
import { getQuizStatistics, getQuizDetailedAnswers } from "../controllers/quizStats.controller.js";
import express from "express";
const route = express.Router();

// Health
route.get('/health', (req, res) => {
    res.status(200).json({ message: "Course service is running" });
});

// Courses
route.post('/', createCourse);
route.get('/', getCourses);
route.post('/chat', chatWithCourseAI);
//route.post('/bulk', requireAuth, getBulkCourseById);
route.get('/bulk', getBulkCourseById);
route.get('/:course_id', getCourseById);
route.patch('/:course_id', editCourse);
route.delete('/:course_id', deleteCourse);

// Modules
route.post('/:course_id/modules', createModule);
route.get('/:course_id/modules', getModulesByCourseId);
route.patch('/modules/:module_id', editModule);
route.delete('/modules/:module_id', deleteModule);

// Lessons
route.post('/modules/:module_id/lessons', ...createLesson);
route.get('/modules/:module_id/lessons', getLessonsByModuleId);
route.delete('/lessons/:lesson_id', deleteLesson);

//quiz edit
//route.patch('/:course_id/quizzes/:quiz_id', requireAuth, requireRole("Instructor"), editQuiz);
route.post('/modules/:module_id/quiz', createQuiz);
route.patch('/:course_id/quizzes/:quiz_id', editQuiz);
route.patch('/:course_id/quizzes/questions/:question_id', editQuizQuestion);
route.delete('/:course_id/quizzes/:quiz_id', deleteQuiz);
route.delete('/:course_id/quizzes/questions/:question_id', deleteQuizQuestion);
route.get('/quizzes/:quiz_id', getQuizById);
route.get('/quizzes/:quiz_id/questions', getQuestionsByQuizId);


//quiz attempt
route.post('/:course_id/quizzes/:quiz_id/start', startQuiz);
route.post('/quiz-attempts/:attempt_id', submitQuiz);
route.get('/quiz/:quiz_id/analytics', getDetailedQuizAnalytics);

// Quiz statistics with LangGraph
route.get('/quizzes/:quiz_id/statistics', getQuizStatistics);
route.get('/quizzes/:quiz_id/detailed-answers', getQuizDetailedAnswers);

//analytics
route.get('/instructor/courses', getInstructorCourse);
//route.get('/:course_id/analytics', requireAuth, requireRole("Instructor"), getCourseAnalytics);

//quizz
route.get('/quizzes/:quiz_id/analytics', getQuizAnalytics);



// Backward compatible aliases (optional)
route.post('/my_courses', requireAuth, getBulkCourseById);
route.post('/module', requireAuth, requireRole("Instructor"), createModule);
route.delete('/module', requireAuth, requireRole("Instructor"), deleteModule);
route.patch('/module', requireAuth, requireRole("Instructor"), editModule);
route.post('/content', requireAuth, requireRole("Instructor"), ...createLesson);
route.delete('/content', requireAuth, requireRole("Instructor"), deleteLesson);

export default route;








