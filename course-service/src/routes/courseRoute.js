import { requireRole } from "@akash1347/auth-lib";
import { requireAuth } from "../config/auth.config.js";
import { createCourse, deleteCourse, editCourse, getBulkCourseById, getCourseById, getCourses } from "../controllers/course.controller.js";
import { createModule, deleteModule, editModule, getModulesByCourseId } from "../controllers/module.controller.js";
import { createLesson, deleteLesson, getLessonsByModuleId,
    createQuiz, editQuiz, editQuizQuestion, deleteQuiz, 
    deleteQuizQuestion, getQuizById, getQuestionsByQuizId } from "../controllers/lesson.controller.js";

import { startQuiz, submitQuiz } from "../controllers/quiz.controller.js";
import { getInstructorCourse, getQuizAnalytics, getDetailedQuizAnalytics } from "../controllers/analytics.controller.js";
import express from "express";
const route = express.Router();

// Health
route.get('/health', (req, res) => {
    res.status(200).json({ message: "Course service is running" });
});

// Courses
route.post('/', requireAuth, requireRole("Instructor"), createCourse);
route.get('/', getCourses);
//route.post('/bulk', requireAuth, getBulkCourseById);
route.get('/bulk', requireAuth, getBulkCourseById);
route.get('/:course_id', getCourseById);
route.patch('/:course_id', requireAuth, requireRole("Instructor"), editCourse);
route.delete('/:course_id', requireAuth, requireRole("Instructor"), deleteCourse);

// Modules
route.post('/:course_id/modules', requireAuth, requireRole("Instructor"), createModule);
route.get('/:course_id/modules', requireAuth, getModulesByCourseId);
route.patch('/modules/:module_id', requireAuth, requireRole("Instructor"), editModule);
route.delete('/modules/:module_id', requireAuth, requireRole("Instructor"), deleteModule);

// Lessons
route.post('/modules/:module_id/lessons', requireAuth, requireRole("Instructor"), ...createLesson);
route.get('/modules/:module_id/lessons', requireAuth, getLessonsByModuleId);
route.delete('/lessons/:lesson_id', requireAuth, requireRole("Instructor"), deleteLesson);

//quiz edit
//route.patch('/:course_id/quizzes/:quiz_id', requireAuth, requireRole("Instructor"), editQuiz);
route.post('/modules/:module_id/quiz', requireAuth, requireRole("Instructor"), createQuiz);
route.patch('/:course_id/quizzes/:quiz_id', requireAuth, requireRole("Instructor"), editQuiz);
route.patch('/:course_id/quizzes/questions/:question_id', requireAuth, requireRole("Instructor"), editQuizQuestion);
route.delete('/:course_id/quizzes/:quiz_id', requireAuth, requireRole("Instructor"), deleteQuiz);
route.delete('/:course_id/quizzes/questions/:question_id', requireAuth, requireRole("Instructor"), deleteQuizQuestion);
route.get('/quizzes/:quiz_id', requireAuth, getQuizById);
route.get('/quizzes/:quiz_id/questions', requireAuth, getQuestionsByQuizId);


//quiz attempt
route.post('/:course_id/quizzes/:quiz_id/start', requireAuth, startQuiz);
route.post('/quiz-attempts/:attempt_id', requireAuth, submitQuiz);
route.get('/quiz/:quiz_id/analytics', requireAuth, getDetailedQuizAnalytics);

//analytics
route.get('/instructor/courses', requireAuth, requireRole("Instructor"), getInstructorCourse);
//route.get('/:course_id/analytics', requireAuth, requireRole("Instructor"), getCourseAnalytics);

//quizz
route.get('/quizzes/:quiz_id/analytics', requireAuth, getQuizAnalytics);



// Backward compatible aliases (optional)
route.post('/my_courses', requireAuth, getBulkCourseById);
route.post('/module', requireAuth, requireRole("Instructor"), createModule);
route.delete('/module', requireAuth, requireRole("Instructor"), deleteModule);
route.patch('/module', requireAuth, requireRole("Instructor"), editModule);
route.post('/content', requireAuth, requireRole("Instructor"), ...createLesson);
route.delete('/content', requireAuth, requireRole("Instructor"), deleteLesson);

export default route;




