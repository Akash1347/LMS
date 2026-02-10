import pool from "../config/db.js";
import { uploadToCloudinary } from "../config/cloudConfig.js";
import { upload } from "../config/cloudConfig.js";
import { v2 as cloudinary } from "cloudinary";
import asyncHandler from "../utils/async-handler.js";

export const createLesson = [
    upload, // multer memory middleware
    asyncHandler(async (req, res) => {
        const { module_id, title, type } = req.body;
        let { order_index } = req.body;

        console.log("Request body:", req.body);
        console.log("File received:", req.file);

        if (!module_id || !title || !type || !order_index) {
            return res.status(400).json({
                success: false,
                message: "module_id, title, type and order_index are required",
            });
        }

        if (!req.file || !req.file.buffer) {
            return res.status(400).json({
                success: false,
                message: "File is required",
            });
        }
        console.log("file receved:", req.file);

        order_index = parseInt(order_index, 10);

        const isPdf = req.file.mimetype === "application/pdf";

        // Upload to Cloudinary (force raw for PDFs)
        const uploadResult = await uploadToCloudinary(req.file.buffer, {
            folder: "lms-content",
            resource_type: isPdf ? "raw" : "auto",
        });
        console.log("Cloudinary upload result:", uploadResult);
        const publicId = uploadResult.public_id;

        let content_ref = uploadResult.secure_url;
        const resourceType = uploadResult.resource_type; // image | video | raw

        // If PDF/raw is returned with image URL, fix delivery endpoint
        if (resourceType === "raw" && content_ref.includes("/image/upload/")) {
            content_ref = content_ref.replace("/image/upload/", "/raw/upload/");
        }

        console.log("Cloudinary URL:", content_ref);
        console.log("Resource type:", resourceType);

        const result = await pool.query(
            `
        INSERT INTO lesson (module_id, title, type, content_ref, order_index, public_id) 
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING *
        `,
            [module_id, title, type, content_ref, order_index, publicId]
        );

        return res.status(201).json({
            success: true,
            message: "Lesson created successfully",
            data: result.rows[0],
            resourceType,
        });
    }),
];

export const deleteLesson = asyncHandler(async (req, res) => {
    const { lesson_id, public_id } = req.body;
    if (!lesson_id || !public_id) {
        return res.status(400).json({ success: false, message: "lesson_id and public_id are required" });
    }
    const instructorId = req.user.sub;
    if (!instructorId) {
        return res.status(401).json({ success: false, message: "Unauthorized" });
    }
    console.log(lesson_id, public_id, instructorId);
    const result = await pool.query(
        `DELETE FROM lesson l
        USING module m, course c
        WHERE l.module_id = m.id 
        AND m.course_id = c.id
        AND c.instructor_id = $1
        AND l.id = $2
        RETURNING l.id`,
        [instructorId, lesson_id]
    );
    if (result.rows.length === 0) {
        return res.status(404).json({ success: false, message: "Lesson not found or you don't have permission to delete this lesson" });
    }

    // Delete from Cloudinary *** it taking 2-4 sec to delte and this opteration is not critical in main flow so we can
    // perform it asynchronously using rabbitMQ
    try {
        const deleteResult = await cloudinary.uploader.destroy(public_id);
        console.log("Cloudinary deletion result:", deleteResult);
    } catch (cloudinaryError) {
        console.error("Error deleting from Cloudinary:", cloudinaryError);
        // Don't fail the entire request if Cloudinary deletion fails
        // The database record was successfully deleted
    }

    return res.status(200).json({
        success: true,
        message: "Lesson deleted successfully",
        data: { deleted_lesson_id: result.rows[0].id }
    });
});

