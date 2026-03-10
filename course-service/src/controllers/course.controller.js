import asyncHandler from "../utils/async-handler.js";
import axios from "axios";
import { emitCoursePublished, emitCourseUpdated, emitCourseDeleted } from "../events/emitCoursePublished.js";
import { upload, uploadToCloudinary } from "../config/cloud.config.js";
import { getModulesByCourseIdRepository } from "../repositories/module.repositories.js";
import {
    createCourseRepository,
    deleteCourseRepository,
    editCourseRepository,
    getCoursesRepository,
    getCourseByIdRepository,
    getBulkCourseByIdRepository,
} from "../repositories/course.repositories.js";


export const createCourse = [
    upload,
    asyncHandler(async (req, res) => {
        const {
            title,
            description,
            category,
            categories,
            level,
            status,
            language,
            price,
            currency
        } = req.body;

        if (!title || !level) {
            return res.status(400).json({ success: false, message: "Title and level are required" });
        }

        const defaultCourseImage = process.env.DEFAULT_COURSE_IMAGE_URL || "https://res.cloudinary.com/demo/image/upload/v1312461204/sample.jpg";
        let courseImageUrl = defaultCourseImage;

        const incomingCategory = category ?? categories;

        const normalizedCategory = Array.isArray(incomingCategory)
            ? incomingCategory
            : String(incomingCategory || "")
                .split(",")
                .map((item) => item.trim())
                .filter(Boolean);

        const categoryToStore = normalizedCategory.length > 0 ? normalizedCategory : ["general"];

        if (req.file?.buffer) {
            try {
                const uploadResult = await uploadToCloudinary(req.file.buffer, {
                    folder: "lms-course",
                    resource_type: "image",
                });
                courseImageUrl = uploadResult?.secure_url || defaultCourseImage;
            } catch (error) {
                console.error("Course image upload failed, using default image:", error?.message || error);
                courseImageUrl = defaultCourseImage;
            }
        }

        const instructorId = req.headers['x-user-id'];
        const result = await createCourseRepository({
            title,
            description,
            category: categoryToStore,
            level,
            status,
            language,
            instructorId,
            price,
            currency,
            courseImageUrl,
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
    })
];

export const deleteCourse = asyncHandler(async (req, res) => {
    const course_id = req.params.course_id;
    const instructorId = req.headers['x-user-id'];

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
    const instructorId = req.headers['x-user-id'];

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
    const courseResult = await getCourseByIdRepository({ course_id });
    console.log("[getCourseById] courseResult rows:", courseResult.rows);
    if (courseResult.rows.length === 0) {
        return res.status(404).json({ success: false, message: "Course not found" });
    }

    const course = courseResult.rows[0];

    const moduleResult = await getModulesByCourseIdRepository({ course_id });
    const modules = moduleResult.rows || [];
    console.log("[getCourseById] modules:", modules);

    let instructor = null;
    try {
        const instructorResponse = await axios.get(`${process.env.AUTH_SERVICE_URL}/api/auth/public/user/${course.instructor_id}/name`);
        const instructorData = instructorResponse?.data?.data;
        if (instructorData) {
            instructor = {
                id: instructorData.user_id,
                name: instructorData.user_name,
            };
        }
        console.log("[getCourseById] instructor:", instructor);
    } catch (error) {
        console.log("[getCourseById] instructor fetch error:", error?.message || error);
        instructor = null;
    }

    return res.status(200).json({
        success: true,
        message: "Course retrieved successfully",
        data: {
            course,
            modules,
            instructor,
        }
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
