
import pool from "../config/db.js";
import { uploadToCloudinary } from "../config/cloudConfig.js";
import { upload } from "../config/cloudConfig.js";

export const createCourse = async (req, res) => {
    try {

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
        const result = await pool.query(
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
                currency || "USD"
            ]
        );

        res.status(201).json({
            success: true,
            message: "Course created successfully",
            data: result.rows[0]
        });
    } catch (error) {
        console.error("Error creating course:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
}


export const createModule = async (req, res) => {
    const { course_id, title, order_index } = req.body;
    const instructorId = req.user.sub;

    try {
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

    } catch (err) {
        console.error("Error creating module:", err);

        // Handle specific constraint violations
        if (err.code === '23505') { // Unique constraint violation
            if (err.constraint === 'module_course_id_order_index_key') {
                return res.status(409).json({
                    success: false,
                    message: `Module with order_index ${order_index} already exists for course ${course_id}`
                });
            }
        }

        res.status(500).json({
            success: false,
            message: "Internal server error",
            error: err.message
        });
    }
}



export const createLesson = [
  upload, // multer memory middleware
  async (req, res) => {
    try {
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

      order_index = parseInt(order_index, 10);

      const isPdf = req.file.mimetype === "application/pdf";

      // Upload to Cloudinary (force raw for PDFs)
      const uploadResult = await uploadToCloudinary(req.file.buffer, {
        folder: "lms-content",
        resource_type: isPdf ? "raw" : "auto",
      });

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
        INSERT INTO lesson (module_id, title, type, content_ref, order_index) 
        VALUES ($1, $2, $3, $4, $5)
        RETURNING *
        `,
        [module_id, title, type, content_ref, order_index]
      );

      return res.status(201).json({
        success: true,
        message: "Lesson created successfully",
        data: result.rows[0],
        resourceType,
      });
    } catch (error) {
      console.error("Create lesson error:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to create lesson",
        error: error.message || "Unknown error occurred",
      });
    }
  },
];





