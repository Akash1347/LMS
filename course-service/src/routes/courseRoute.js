import { requireRole } from "@akash1347/auth-lib";
import { requireAuth } from "../config/auth.config.js";
import { createCourse, deleteCourse, editCourse } from "../controllers/courseController.js";
import { createModule, deleteModule, editModule } from "../controllers/moduleController.js";
import { createLesson, deleteLesson } from "../controllers/lessonController.js";
import express from "express";
import { upload } from "../config/cloudConfig.js";
const route = express.Router();

// POST /api/course - Create a new course
route.post('/', requireAuth, requireRole("Instructor"), createCourse);
route.delete('/', requireAuth, requireRole("Instructor"), deleteCourse);
route.patch('/', requireAuth, requireRole("Instructor"), editCourse);

// GET /api/course - Get all courses (optional)
route.get('/', (req, res) => {
    res.status(200).json({
        message: "Course service is running",
        endpoints: {
            GET: "/api/course - Get service status",
            POST: "/api/course - Create a new course (requires auth and Instructor role)"
        }
    });
});
route.post('/module', requireAuth, requireRole("Instructor"), createModule);
route.delete('/module', requireAuth, requireRole("Instructor"), deleteModule);
route.patch('/module', requireAuth, requireRole("Instructor"), editModule);
 

route.post('/content', requireAuth, requireRole("Instructor"), ...createLesson);
route.delete('/content', requireAuth, requireRole("Instructor"), deleteLesson);

export default route;

