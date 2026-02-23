import pool from "../config/db.js";
import axios from "axios";

export const createCourseRepository = async ({
    title,
    description,
    category,
    level,
    language,
    instructorId,
    price,
    currency,
}) => {
    return pool.query(
        `
        INSERT INTO course
        (title, description, category, level, language, instructor_id, price, currency)
        VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
        RETURNING *
        `,
        [
            title,
            description || "",
            category ? `{${category}}` : null,
            level,
            language ? `{${language}}` : "{english}",
            instructorId,
            price || 0,
            currency || "USD",
        ]
    );
};

export const deleteCourseRepository = async ({ course_id, instructorId }) => {
    return pool.query(
        `DELETE FROM course 
        WHERE id = $1 AND instructor_id = $2
        RETURNING id`,
        [course_id, instructorId]
    );
};

export const editCourseRepository = async ({
    title,
    description,
    category,
    level,
    language,
    price,
    currency,
    course_id,
    instructorId,
}) => {
    return pool.query(
        `
        UPDATE course SET 
            title = COALESCE($1, title),
            description = COALESCE($2, description),
            category = COALESCE($3, category),
            level = COALESCE($4, level),
            language = COALESCE($5, language),
            price = COALESCE($6, price),
            currency = COALESCE($7, currency)
        WHERE id = $8 AND instructor_id = $9
        RETURNING *
        `,
        [title, description, category ? `{${category}}` : null, level, language ? `{${language}}` : null, price, currency, course_id, instructorId]
    );
};

export const getCoursesRepository = async () => {
    return pool.query(`SELECT * FROM course`);
};

export const getCourseByIdRepository = async ({ course_id }) => {
    return pool.query(`SELECT * FROM course WHERE id = $1`, [course_id]);
};

export const getBulkCourseByIdRepository = async ({ course_ids }) => {
    return pool.query(`SELECT * FROM course WHERE id = ANY($1)`, [course_ids]);
};


export const getUserEnrolledCoursesRepository = async ({ user_id }) => {

    const result = await axios.get(`${process.env.ENROLLMENT_SERVICE_URL}/enrollments/user/${user_id}`);
    const enrolledCourseIds = result.data.data.map(enrollment => enrollment.course_id);
    return enrolledCourseIds;
};   



