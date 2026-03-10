import pool from "../config/db.config.js";
import axios from "axios";

export const createCourseRepository = async ({
    title,
    description,
    category,
    level,
    status,
    language,
    instructorId,
    price,
    currency,
    courseImageUrl,
}) => {
const normalizedCategory = Array.isArray(category)
        ? category
        : String(category || "")
            .split(",")
            .map((item) => item.trim())
            .filter(Boolean);

const baseValues = [
        title,
        description || "",
        normalizedCategory.length > 0 ? normalizedCategory : ["general"],
        level,
        language || "english",
        status || "draft",
        instructorId,
        price || 0,
        currency || "USD",
    ];

    // Try with schema using thumbnail_url first
    try {
        return await pool.query(
            `
        INSERT INTO course
        (title, description, category, level, language, status, instructor_id, price, currency, thumbnail_url)
        VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
        RETURNING *
        `,
            [...baseValues, courseImageUrl || "null"]
        );
    } catch (error) {
        // Fallback to schema using thumbnail column name
        if (error?.code !== "42703") throw error;
    }

    try {
        return await pool.query(
            `
        INSERT INTO course
        (title, description, category, level, language, status, instructor_id, price, currency, thumbnail)
        VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
        RETURNING *
        `,
            [...baseValues, courseImageUrl || null]
        );
    } catch (error) {
        if (error?.code !== "42703") throw error;
    }

    // Final fallback for older schema
    return pool.query(
        `
        INSERT INTO course
        (title, description, category, level, language, status, instructor_id, price, currency)
        VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
        RETURNING *
        `,
        baseValues
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
    const normalizedCategory = Array.isArray(category)
        ? category
        : typeof category === "string"
            ? category
                .split(",")
                .map((item) => item.trim())
                .filter(Boolean)
            : null;

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
        [title, description, normalizedCategory, level, language, price, currency, course_id, instructorId]
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


export const getUserEnrolledCoursesRepository = async ({ authorization, course_id, user_id }) => {
    
    const result = await axios.get(
        `${process.env.ENROLLMENT_SERVICE_URL}/api/enrollment/enrolled/${course_id}`,
        {
            headers: {
                Authorization: authorization,
                "x-user-id": user_id,
            },
        }
    );

    return Boolean(result?.data?.data?.enrolled ?? result?.data?.enrolled);
    

    
};











