import pool from "../config/db.js";
import asyncHandler from "../utils/async-handler.js";

export const createModule = asyncHandler(async (req, res) => {
    const { title, order_index } = req.body;
    const course_id = req.params.course_id || req.body.course_id;
    const instructorId = req.user.sub;

    if (!course_id || !title || !order_index) {
        return res.status(400).json({ success: false, message: "course_id, title and order_index are required" });
    }

    // Check if course exists and belongs to the instructor
    const courseCheck = await pool.query(
        `SELECT id FROM course WHERE id = $1 AND instructor_id = $2`,
        [course_id, instructorId]
    );

    if (courseCheck.rows.length === 0) {
        return res.status(404).json({ success: false, message: "Course not found or you don't have permission to add modules to this course" });
    }

    // Check if order_index already exists for this course
    const existingOrder = await pool.query(
        `SELECT id FROM module WHERE course_id = $1 AND order_index = $2`,
        [course_id, order_index]
    );

    if (existingOrder.rows.length > 0) {
        return res.status(409).json({ success: false, message: `Module with order_index ${order_index} already exists for this course. Please use a different order_index.` });
    }

    const result = await pool.query(
        `
        INSERT INTO module (course_id, title, order_index) 
        VALUES ($1, $2, $3)
        RETURNING *
        `, [course_id, title, order_index]
    );

    res.status(201).json({
        success: true,
        message: "Module created successfully",
        data: result.rows[0]
    });
});

export const editModule = asyncHandler(async (req, res) => {
    const { title, order_index } = req.body;
    const module_id = req.params.module_id;
    const instructorId = req.user.sub;

    if (!module_id) {
        return res.status(400).json({ success: false, message: "module_id is required" });
    }
    const result = await pool.query(
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
    if (result.rows.length === 0) {
        return res.status(404).json({ success: false, message: "Module not found or you don't have permission to edit this module" });
    }
    return res.status(200).json({
        success: true,
        message: "Module updated successfully",
        data: result.rows[0]
    });
});

export const deleteModule = asyncHandler(async (req, res) => {
    const module_id = req.params.module_id || req.body.module_id;
    const instructorId = req.user.sub;

    if (!module_id) {
        return res.status(400).json({ success: false, message: "module_id is required" });
    }
    const result = await pool.query(
        `DELETE FROM module m
        USING course c
        WHERE m.course_id = c.id
        AND c.instructor_id = $1
        AND m.id = $2
        RETURNING m.id`,
        [instructorId, module_id]
    );
    if (result.rows.length === 0) {
        return res.status(404).json({ success: false, message: "Module not found or you don't have permission to delete this module" });
    }
    return res.status(200).json({
        success: true,
        message: "Module deleted successfully",
        data: { deleted_module_id: result.rows[0].id }
    });
});

export const getModulesByCourseId= asyncHandler(async (req, res) => {
    const { course_id } = req.params;
    const result = await pool.query(
        `SELECT id, title, order_index FROM module WHERE course_id = $1 ORDER BY order_index`,
        [course_id]
    );
    return res.status(200).json({
        success: true,
        message: "Modules retrieved successfully",
        data: result.rows
    });
});

export const getModuleById = asyncHandler(async (req, res) => {
    const { module_id } = req.params;
    const result = await pool.query(
        `SELECT id, title, order_index FROM module WHERE id = $1`,
        [module_id]
    );
    if (result.rows.length === 0) {
        return res.status(404).json({ success: false, message: "Module not found" });
    }
    return res.status(200).json({
        success: true,
        message: "Module retrieved successfully",
        data: result.rows[0]
    });
});
