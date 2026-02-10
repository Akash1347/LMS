import { requireRole } from "@akash1347/auth-lib";
import { requireAuth } from "../config/auth.config.js";
import { createCourse, createModule, createLesson } from "../controllers/courseController.js";
import express from "express";
import { upload } from "../config/cloudConfig.js";
const route = express.Router();

// POST /api/course - Create a new course
route.post('/', requireAuth, requireRole("Instructor"), createCourse);

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
// Test route without authentication for debugging
route.post('/content-test', ...createLesson);

route.post('/content', requireAuth, ...createLesson);

export default route;

