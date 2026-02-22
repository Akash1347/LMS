import pool from "../config/db.js";
import { uploadToCloudinary } from "../config/cloudConfig.js";
import { upload } from "../config/cloudConfig.js";
import { v2 as cloudinary } from "cloudinary";
import asyncHandler from "../utils/async-handler.js";

export const createLesson = [
    upload, // multer memory middleware
    asyncHandler(async (req, res) => {
        const { title, type } = req.body;
        const module_id = req.params.module_id || req.body.module_id;
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
    const public_id = req.body.public_id;
    const lesson_id = req.params.lesson_id || req.body.lesson_id;
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

export const getLessonsByModuleId = asyncHandler(async (req, res) => {
    const { module_id } = req.params;
    if (!module_id) {
        return res.status(400).json({ success: false, message: "module_id is required" });
    }
    const result = await pool.query(
        `SELECT id, title, type, content_ref, order_index 
        FROM lesson
        WHERE module_id = $1
        ORDER BY order_index ASC`,
        [module_id]
    );
    return res.status(200).json({
        success: true,
        message: "Lessons retrieved successfully",
        data: result.rows
    });
});

export const createQuiz = asyncHandler(async (req, res) => {
    const { course_id, title, description, time_limit, total_marks } = req.body;
    const instructorId = req.user.sub;

    if (!course_id || !title) {
        return res.status(400).json({ success: false, message: "course_id and title are required" });
    }
    const isInstructorCanCreateQuiz = await pool.query(
        `SELECT 1 FROM course WHERE id = $1 AND instructor_id = $2`,
        [course_id, instructorId]
    );

    if (isInstructorCanCreateQuiz.rows.length === 0) {
        return res.status(403).json({ success: false, message: "You don't have permission to create quiz for this course" });
    }
    // start transaction
    await pool.query("BEGIN");
    try {
        const quizResult = await pool.query(
            `INSERT INTO quizzes (course_id, title, description, time_limit, total_marks) 
            VALUES ($1, $2, $3, $4, $5)
            RETURNING *`,
            [course_id, title, description || "", time_limit || null, total_marks || 0]
        );
        const quizId = quizResult.rows[0].id;

        // insert bulk questions
        const questions = req.body.questions || [];
        const questionValues = [];
        const questionPlaceholders = [];

        questions.forEach((q, index) => {
            let parsedOptions = q.options || [];

            if (typeof parsedOptions === "string") {
                try {
                    parsedOptions = JSON.parse(parsedOptions);
                } catch (_err) {
                    throw new Error(`Invalid JSON format for options at question index ${index}`);
                }
            }

            const correctOptionId = q.correct_option_id || q.correct_answer_id || q.correct_answer;

            if (!correctOptionId) {
                throw new Error(`correct_option_id (or correct_answer_id) is required at question index ${index}`);
            }

            const baseIndex = index * 5;
            questionPlaceholders.push(
                `($${baseIndex + 1}, $${baseIndex + 2}, $${baseIndex + 3}, $${baseIndex + 4}, $${baseIndex + 5})`
            );

            questionValues.push(
                quizId,
                q.question_text,
                JSON.stringify(parsedOptions),
                correctOptionId,
                q.marks || 0
            );
        });

        if (questionValues.length > 0) {
            await pool.query(
                `INSERT INTO questions (quiz_id, question_text, options, correct_option_id, marks) 
                    VALUES ${questionPlaceholders.join(", ")}`,
                questionValues
            );
        }

        await pool.query("COMMIT");
        return res.status(201).json({
            success: true,
            message: "Quiz created successfully",
            data: quizResult.rows[0]
        });
    } catch (error) {
        await pool.query("ROLLBACK");
        throw error;
    }
}
);













