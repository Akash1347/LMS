import pool from "../config/dbConfig.js";
import asyncHandler from "../utils/async-handler.js";

export const enrollInCourse = asyncHandler(async (req, res) => {
    const {courseId} = req.body;
    const userId = req.user.sub;

    if(!courseId) {
        return res.status(400).json({ success: false, message: "courseId is required" });
    }
    const courseExists = await pool.query(
        `
        SELECT * FROM course_enrollment_snapshot
        WHERE course_id = $1
        `,
        [courseId]
    );
    if(courseExists.rows.length === 0) {
        return res.status(404).json({ success: false, message: "Course not found" });
    };
    const existingEnrollment = await pool.query(
        `
        SELECT * FROM enrollment
        WHERE course_id = $1 AND user_id = $2
        `,
        [courseId, userId]
    );
    if(existingEnrollment.rows.length > 0) {
        return res.status(400).json({ success: false, message: "User is already enrolled in this course" });
    }

    const result = await pool.query(
        `
        INSERT INTO enrollment (course_id, user_id, status)
        VALUES ($1, $2, 'pending')
        RETURNING *
        `,
        [courseId, userId]
    );
    res.status(201).json({
        success: true,
        message: "Enrollment created successfully",
        data: result.rows[0]
    });
});

export const getUserEnrollments = asyncHandler(async (req, res) => {
    const userId = req.user.sub;
    console.log(userId);
    const result = await pool.query(
        `
        SELECT course_id, status, enrolled_at
        FROM enrollment
        WHERE user_id = $1
        `,
        [userId]
    );
    res.status(200).json({
        success: true,
        message: "User enrollments retrieved successfully",
        data: result.rows
    });
});



