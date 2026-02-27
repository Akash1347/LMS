import asyncHandler from "../utils/async-handler.js";
import { emitCoursePublished, emitCourseUpdated, emitCourseDeleted } from "../events/emitCoursePublished.js";
import {
    createCourseRepository,
    deleteCourseRepository,
    editCourseRepository,
    getCoursesRepository,
    getCourseByIdRepository,
    getBulkCourseByIdRepository,
} from "../repositories/course.repositories.js";


export const createCourse = asyncHandler(async (req, res) => {
    const {
        title,
        description,
        category,
        level,
        language,
        price,
        currency
    } = req.body;

    if (!title || !level) {
        return res.status(400).json({ success: false, message: "Title and level are required" });
    }

    const instructorId = req.user.sub;
    const result = await createCourseRepository({
        title,
        description,
        category,
        level,
        language,
        instructorId,
        price,
        currency,
    });
    const emittedCourseDat = {
        id: result.rows[0].id,
        status: result.rows[0].status,
        price: result.rows[0].price,
        currency: result.rows[0].currency
    };
    await emitCoursePublished(emittedCourseDat);
    res.status(201).json({
        success: true,
        message: "Course created successfully",
        data: result.rows[0]
    });
});

export const deleteCourse = asyncHandler(async (req, res) => {
    const course_id = req.params.course_id;
    const instructorId = req.user.sub;

    if (!course_id) {
        return res.status(400).json({ success: false, message: "course_id is required" });
    }
    const result = await deleteCourseRepository({ course_id, instructorId });
    if (result.rows.length === 0) {
        return res.status(404).json({ success: false, message: "Course not found or you don't have permission to delete this course" });
    }
    await emitCourseDeleted(course_id);
    return res.status(200).json({
        success: true,
        message: "Course deleted successfully",
        data: { deleted_course_id: result.rows[0].id }
    });
});

export const editCourse = asyncHandler(async (req, res) => {
    const { title, description, category, level, language, price, currency } = req.body;
    const course_id = req.params.course_id || req.body.course_id;
    const instructorId = req.user.sub;

    if (!course_id) {
        return res.status(400).json({ success: false, message: "course_id is required" });
    }
    const result = await editCourseRepository({
        title,
        description,
        category,
        level,
        language,
        price,
        currency,
        course_id,
        instructorId,
    });
    if (result.rows.length === 0) {
        return res.status(404).json({ success: false, message: "Course not found or you don't have permission to edit this course" });
    }
    await emitCourseUpdated(result.rows[0]);
    return res.status(200).json({
        success: true,
        message: "Course updated successfully",
        data: result.rows[0]
    });
});

export const getCourses = asyncHandler(async (req, res) => {
    const result = await getCoursesRepository();
    return res.status(200).json({
        success: true,
        message: "Courses retrieved successfully",
        data: result.rows
    });
});

export const getCourseById = asyncHandler(async (req, res) => {
    const { course_id } = req.params;
    const result = await getCourseByIdRepository({ course_id });
    if (result.rows.length === 0) {
        return res.status(404).json({ success: false, message: "Course not found" });
    }
    return res.status(200).json({
        success: true,
        message: "Course retrieved successfully",
        data: result.rows[0]
    });
});


export const getBulkCourseById = asyncHandler(async (req, res) => {
    const bodyCourseIds = req.body?.course_ids;
    const queryCourseIds = req.query?.course_ids;

    let course_ids = bodyCourseIds;
    if (!course_ids && queryCourseIds) {
        course_ids = Array.isArray(queryCourseIds)
            ? queryCourseIds
            : String(queryCourseIds).split(",").map((id) => id.trim()).filter(Boolean);
    }

    if (!course_ids || !Array.isArray(course_ids) || course_ids.length === 0) {
        return res.status(400).json({ success: false, message: "course_ids must be a non-empty array" });
    }
    const result = await getBulkCourseByIdRepository({ course_ids });
    return res.status(200).json({
        success: true,
        message: "Courses retrieved successfully",
        data: result.rows
    });

})
