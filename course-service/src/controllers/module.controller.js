import asyncHandler from "../utils/async-handler.js";
import {
    checkInstructorOwnsCourseForModuleRepository,
    checkModuleOrderExistsRepository,
    createModuleRepository,
    editModuleRepository,
    deleteModuleRepository,
    getModulesByCourseIdRepository,
    getModuleByIdRepository,
} from "../repositories/module.repositories.js";

export const createModule = asyncHandler(async (req, res) => {
    const { title, order_index } = req.body;
    const course_id = req.params.course_id || req.body.course_id;
    const instructorId = req.user.sub;

    if (!course_id || !title || !order_index) {
        return res.status(400).json({ success: false, message: "course_id, title and order_index are required" });
    }

    // Check if course exists and belongs to the instructor
    const courseCheck = await checkInstructorOwnsCourseForModuleRepository({ course_id, instructorId });

    if (courseCheck.rows.length === 0) {
        return res.status(404).json({ success: false, message: "Course not found or you don't have permission to add modules to this course" });
    }

    // Check if order_index already exists for this course
    const existingOrder = await checkModuleOrderExistsRepository({ course_id, order_index });

    if (existingOrder.rows.length > 0) {
        return res.status(409).json({ success: false, message: `Module with order_index ${order_index} already exists for this course. Please use a different order_index.` });
    }

    const result = await createModuleRepository({ course_id, title, order_index });

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
    const result = await editModuleRepository({ title, order_index, instructorId, module_id });
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
    const result = await deleteModuleRepository({ instructorId, module_id });
    if (result.rows.length === 0) {
        return res.status(404).json({ success: false, message: "Module not found or you don't have permission to delete this module" });
    }
    return res.status(200).json({
        success: true,
        message: "Module deleted successfully",
        data: { deleted_module_id: result.rows[0].id }
    });
});

export const getModulesByCourseId = asyncHandler(async (req, res) => {
    const { course_id } = req.params;
    const result = await getModulesByCourseIdRepository({ course_id });
    return res.status(200).json({
        success: true,
        message: "Modules retrieved successfully",
        data: result.rows
    });
});

export const getModuleById = asyncHandler(async (req, res) => {
    const { module_id } = req.params;
    const result = await getModuleByIdRepository({ module_id });
    if (result.rows.length === 0) {
        return res.status(404).json({ success: false, message: "Module not found" });
    }
    return res.status(200).json({
        success: true,
        message: "Module retrieved successfully",
        data: result.rows[0]
    });
});
