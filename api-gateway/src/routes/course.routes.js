import express from "express";
import { courseProxy } from "../proxies/course.proxy.js";
import  authenticate from "../middleware/authenticate.js";
import authorize from "../middleware/autthorize.js";

const router = express.Router();

// Public read routes
router.post('/:course_id/quizzes/:quiz_id/start', authenticate, authorize("Student"), courseProxy);
router.post('/quiz-attempts/:attempt_id', authenticate, authorize("Student"), courseProxy);
router.get('/quiz/:quiz_id/analytics', courseProxy);
router.get('/modules/:module_id/lessons', authenticate, courseProxy);

router.get('/instructor/courses', authenticate, authorize("Instructor"), courseProxy);
router.get('/quizzes/:quiz_id', authenticate, authorize("Instructor"), courseProxy);
router.get('/quizzes/:quiz_id/questions', authenticate, authorize("Instructor"), courseProxy);
 
router.get(/.*/, courseProxy);

// Protected write routes

router.post(/.*/, authenticate, authorize("Instructor"), courseProxy);
router.patch(/.*/, authenticate, authorize("Instructor"), courseProxy);
router.delete(/.*/, authenticate, authorize("Instructor"), courseProxy);

export default router;