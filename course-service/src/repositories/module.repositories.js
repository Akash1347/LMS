import pool from "../config/db.js";

export const checkInstructorOwnsCourseForModuleRepository = async ({ course_id, instructorId }) => {
    return pool.query(`SELECT id FROM course WHERE id = $1 AND instructor_id = $2`, [course_id, instructorId]);
};

export const checkModuleOrderExistsRepository = async ({ course_id, order_index }) => {
    return pool.query(`SELECT id FROM module WHERE course_id = $1 AND order_index = $2`, [course_id, order_index]);
};

export const createModuleRepository = async ({ course_id, title, order_index }) => {
    return pool.query(
        `
        INSERT INTO module (course_id, title, order_index)
        VALUES ($1, $2, $3)
        RETURNING *
        `,
        [course_id, title, order_index]
    );
};

export const editModuleRepository = async ({ title, order_index, instructorId, module_id }) => {
    return pool.query(
        `
        UPDATE module m SET
            title = COALESCE($1, m.title),
            order_index = COALESCE($2, m.order_index)
        FROM course c
        WHERE m.course_id = c.id
        AND c.instructor_id = $3
        AND m.id = $4
        RETURNING m.*
        `,
        [title, order_index, instructorId, module_id]
    );
};

export const deleteModuleRepository = async ({ instructorId, module_id }) => {
    return pool.query(
        `DELETE FROM module m
        USING course c
        WHERE m.course_id = c.id
        AND c.instructor_id = $1
        AND m.id = $2
        RETURNING m.id`,
        [instructorId, module_id]
    );
};

export const getModulesByCourseIdRepository = async ({ course_id }) => {
    return pool.query(
        `SELECT id, title, order_index FROM module WHERE course_id = $1 ORDER BY order_index`,
        [course_id]
    );
};

export const getModuleByIdRepository = async ({ module_id }) => {
    return pool.query(`SELECT id, title, order_index FROM module WHERE id = $1`, [module_id]);
};
