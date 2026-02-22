import pool from "../config/dbConfig.js";

export const insertEnrollment = async (userId, courseId) =>{
    const result = await pool.query(
        'INSERT INTO enrollment (user_id, course_id) VALUES ($1, $2) RETURNING *',
        [userId, courseId]
    );
    return result.rows[0];
};

export const insertEnrollmentCourseSnapshot = async (data) => {
    const result = await pool.query(
        `INSERT INTO course_enrollment_snapshot (course_id, status, price, currency)
        VALUES ($1, $2, $3, $4) RETURNING *`,
        [data.id, data.status, data.price, data.currency]
    );
    return result.rows[0];
};

export const updateEnrollmentCourseSnapshot = async (data) => {
    const result = await pool.query(
        `UPDATE course_enrollment_snapshot SET status = $2, price = $3, currency = $4
        WHERE course_id = $1 RETURNING *`,
        [data.id, data.status, data.price, data.currency]
    );
    return result.rows[0];
};

export const deleteEnrollmentCourseSnapshot = async (data) => {
    
    await pool.query(
        `DELETE FROM course_enrollment_snapshot WHERE course_id = $1`,
        [data.courseId]
    );
};