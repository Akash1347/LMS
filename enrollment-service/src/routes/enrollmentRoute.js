import { Router } from "express";
import { requireAuth } from "../config/auth.config.js";
import { requireRole } from "@akash1347/auth-lib";
import { enrollInCourse, getUserEnrollments, UserEnrolledInCourse,
    getCourseAnalytics
 } from "../controllers/enrollmentController.js";
const route = Router();

route.get('/my-enrollments', requireAuth, requireRole("Student"), getUserEnrollments);
route.post('/enroll',requireAuth, requireRole("Student"), enrollInCourse);
route.get('/enrolled/:courseId', requireAuth, requireRole("Student"), UserEnrolledInCourse);

//analytics
route.get('/analytics/:courseId', requireAuth, requireRole("Instructor"), getCourseAnalytics);



export default route;