import pool from "../config/db.config.js";
import asyncHandler from "../utils/async-handler.js";
import logger from "../config/logger.config.js";
import { insertEnrollment, insertEnrollmentCourseSnapshot, updateEnrollmentCourseSnapshot, deleteEnrollmentCourseSnapshot, getUserEnrollmentsRepository, isUserEnrolledInCourse } from "../repositories/enrollmentRepository.js";

 
export const getUserEnrollments = asyncHandler(async (req, res) => {
    const userId = req.headers['x-user-id'];

    logger.info({ event: "fetch_user_enrollments", userId });
    const result = await getUserEnrollmentsRepository(userId);
    res.status(200).json({
        success: true,
        message: "User enrollments retrieved successfully",
        data: result
    });
});

export const enrollInCourse = asyncHandler(async(req, res) => {
    const {courseId} = req.body;
    const userId = req.headers['x-user-id'];
    logger.info({ event: "enrollment_request_received", userId, courseId });
     
    if(!courseId) {
        logger.warn({ event: "enrollment_rejected", reason: "missing_course_id", userId });
        return res.status(400).json({ success: false, message: "courseId is required" });
    }
    const courseExists = await pool.query(
        `SELECT * FROM course_enrollment_snapshot
        WHERE course_id = $1`
        , [courseId]
    )
    if(courseExists.rows.length === 0) {
        logger.warn({ event: "enrollment_rejected", reason: "course_not_found", userId, courseId });
        return res.status(404).json({ success: false, message: "Course not found" });
    }

    const existingEnrollment = await pool.query(    
        `SELECT * FROM enrollment
        WHERE course_id = $1 AND user_id = $2`
        , [courseId, userId]
    )
    if(existingEnrollment.rows.length > 0) {
        logger.warn({ event: "enrollment_rejected", reason: "already_enrolled", userId, courseId });
        return res.status(400).json({ success: false, message: "User is already enrolled in this course" });
    }

    // Enroll the course which has price 0 directly
    if(courseExists.rows[0].price === 0) {
        const result = await pool.query(
            `INSERT INTO enrollment (course_id, user_id, status)
            VALUES ($1, $2, 'active')
            RETURNING *`
            , [courseId, userId]
        )
        logger.info({ event: "enrollment_created", status: "active", userId, courseId });
        return res.status(201).json({
            success: true,
            message: "Enrolled in course successfully",
            data: result.rows[0]
        })
        // we have emit event 


    }

    // For paid courses, create a pending enrollment 
    const result = await pool.query(
        `INSERT INTO enrollment (course_id, user_id, status)
        VALUES ($1, $2, 'pending')
        RETURNING *`
        , [courseId, userId]
    )

    res.status(201).json({
        success: true,
        message: "Enrollment created successfully. Please proceed to payment.",
        data: result.rows[0]
    })
    logger.info({ event: "enrollment_created", status: "pending", userId, courseId });
    // we have to emit event for pending enrollment

});


export const UserEnrolledInCourse = asyncHandler(async (req, res) => {
    const userId = req.headers['x-user-id'];
    const courseId = req.params.courseId;
    if (!courseId) {
        logger.warn({ event: "enrollment_check_rejected", reason: "missing_course_id", userId });
        return res.status(400).json({ success: false, message: "courseId is required" });
    }

    const result = await isUserEnrolledInCourse(userId, courseId);
    logger.info({ event: "enrollment_check_completed", userId, courseId, enrolled: result });
    res.status(200).json({
        success: true,
        message: result ? "User is enrolled in course" : "User is not enrolled in course",
        data: {
            enrolled: result,
            courseId,
        }
    });
});


export const getCourseAnalytics = asyncHandler(async (req, res) => {
    const courseId = req.params.courseId;
    const instructorId = req.headers['x-user-id'];
    logger.info({ event: "fetch_course_enrollment_analytics", courseId, instructorId });

    const getAnalytics = await pool.query(
        `SELECT COUNT(*) as enrolled_students FROM enrollment WHERE course_id = $1 AND status = 'active'`,
        [courseId]
    );
        
    if(getAnalytics.rows.length === 0) {
        return res.status(404).json({ message: 'No analytics found for this course' });
    }

    return res.status(200).json(getAnalytics.rows[0]);
});