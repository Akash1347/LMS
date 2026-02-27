import { uploadToCloudinary } from "../config/cloudConfig.js";
import { upload } from "../config/cloudConfig.js";
import { v2 as cloudinary } from "cloudinary";
import asyncHandler from "../utils/async-handler.js";
import {
    createLessonRepository,
    deleteLessonRepository,
    getLessonsByModuleIdRepository,
    checkLessonOrderExistsRepository,
    checkInstructorCanCreateQuizRepository,
    beginLessonTransactionRepository,
    commitLessonTransactionRepository,
    rollbackLessonTransactionRepository,
    createQuizRepository,
    createQuestionsBulkRepository,
    createQuizLessonMappingRepository,
    editQuizRepository,
    editQuizQuestionRepository,
    deleteQuizRepository,
    deleteQuizQuestionRepository,
    getQuizByIdRepository,
    getQuestionsByQuizIdRepository,

} from "../repositories/lesson.repositories.js";
import { getUserEnrolledCoursesRepository } from "../repositories/course.repositories.js";

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

        const result = await createLessonRepository({ module_id, title, type, content_ref, order_index, publicId });

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
    const result = await deleteLessonRepository({ instructorId, lesson_id });
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
    const result = await getLessonsByModuleIdRepository({ module_id });
    return res.status(200).json({
        success: true,
        message: "Lessons retrieved successfully",
        data: result.rows
    });
});

export const createQuiz = asyncHandler(async (req, res) => {
    const { course_id, title, description, time_limit, total_marks, type } = req.body;
    const module_id = req.params.module_id || req.body.module_id;
    const { order_index } = req.body;
    const instructorId = req.user.sub;

    if (!course_id || !title || !module_id || !order_index) {
        return res.status(400).json({ success: false, message: "course_id, module_id, title and order_index are required" });
    }

    const existingOrder = await checkLessonOrderExistsRepository({ module_id, order_index });
    if (existingOrder.rows.length > 0) {
        return res.status(409).json({
            success: false,
            message: `Lesson with order_index ${order_index} already exists for this module. Please use a different order_index.`
        });
    }

    const isInstructorCanCreateQuiz = await checkInstructorCanCreateQuizRepository({ course_id, instructorId });

    if (isInstructorCanCreateQuiz.rows.length === 0) {
        return res.status(403).json({ success: false, message: "You don't have permission to create quiz for this course" });
    }


    // start transaction
    await beginLessonTransactionRepository();
    try {
        const lessonType = type || "quiz";
        const quizResult = await createQuizRepository({
            course_id,
            title,
            description,
            time_limit,
            total_marks,
        });
        const quizId = quizResult.rows[0].id;

        const questions = req.body.questions || [];
        await createQuestionsBulkRepository({ quizId, questions });

        //make lesson-quiz mapping 

        let quizContentRef = `quiz:${quizId}`;
        const quizMapping = await createQuizLessonMappingRepository({
            module_id,
            title,
            type: lessonType,
            quizContentRef,
            time_limit,
            order_index,
        });

        await commitLessonTransactionRepository();


        return res.status(201).json({
            success: true,
            message: "Quiz created successfully",
            data: { quiz: quizResult.rows[0], lesson: quizMapping.rows[0] }
        });

    } catch (error) {
        await rollbackLessonTransactionRepository();
        throw error;
    }
}
);

export const deleteQuiz = asyncHandler(async (req, res) => {

    const quiz_id = req.params.quiz_id;
    const instructorId = req.user.sub;
    const course_id = req.params.course_id;
    if (!quiz_id) {
        return res.status(400).json({ success: false, message: "quiz_id is required" });
    }

    const isInstructorCanCreateQuiz = await checkInstructorCanCreateQuizRepository({ course_id, instructorId });
    if (isInstructorCanCreateQuiz.rows.length === 0) {
        return res.status(403).json({ success: false, message: "You don't have permission to delete this quiz" });
    }
    const deleteQuizResult = await deleteQuizRepository({ quiz_id });
    if (deleteQuizResult.rows.length === 0) {
        return res.status(404).json({ success: false, message: "Quiz not found" });
    }
    return res.status(200).json({
        success: true,
        message: "Quiz deleted successfully",
        data: deleteQuizResult.rows[0]
    });
});
export const editQuiz = asyncHandler(async (req, res) => {
    const quiz_id = req.params.quiz_id;
    const { title, description, time_limit, total_marks } = req.body;
    const instructorId = req.user.sub;
    const course_id = req.params.course_id;
    if (!quiz_id) {
        return res.status(400).json({ success: false, message: "quiz_id is required" });
    }
    const isInstructorCanCreateQuiz = await checkInstructorCanCreateQuizRepository({ course_id, instructorId });
    if (isInstructorCanCreateQuiz.rows.length === 0) {
        return res.status(403).json({ success: false, message: "You don't have permission to edit this quiz" });
    }
    const editResult = await editQuizRepository({ quiz_id, title, description, time_limit, total_marks });
    if (editResult.rows.length === 0) {
        return res.status(404).json({ success: false, message: "Quiz not found" });
    }
    return res.status(200).json({
        success: true,
        message: "Quiz updated successfully",
        data: editResult.rows[0]
    });
});

export const getQuizById = asyncHandler(async (req, res) => {
    const quiz_id = req.params.quiz_id;
    if (!quiz_id) {
        return res.status(400).json({ success: false, message: "quiz_id is required" });
    };
    const user_id = req.user.sub;
    const authorization = req.headers.authorization;
    if (!user_id) {
        return res.status(401).json({ success: false, message: "Unauthorized" });
    }
    if (!authorization) {
        return res.status(401).json({ success: false, message: "Authorization header missing" });
    }
    // fetch quiz first
    const quizResult = await getQuizByIdRepository({ quiz_id });
    if (quizResult.rows.length === 0) {
        return res.status(404).json({ success: false, message: "Quiz not found" });
    }

    const courseIdOfQuiz = quizResult.rows[0].course_id;

    // allow instructor owner to access quiz directly
    const isInstructorOwner = await checkInstructorCanCreateQuizRepository({
        course_id: courseIdOfQuiz,
        instructorId: user_id,
    });
    if (isInstructorOwner.rows.length > 0) {
        return res.status(200).json({
            success: true,
            message: "Quiz retrieved successfully",
            data: quizResult.rows[0]
        });
    }

    let enrolledCourseIds = [];
    try {
        enrolledCourseIds = await getUserEnrolledCoursesRepository({ authorization });
    } catch (error) {
        console.error("Enrollment verification failed in getQuizById:", error?.response?.status, error?.response?.data || error?.message);
        return res.status(503).json({
            success: false,
            message: "Unable to verify enrollment right now. Please try again."
        });
    }

    if (!Array.isArray(enrolledCourseIds) || !enrolledCourseIds.includes(courseIdOfQuiz)) {
        return res.status(403).json({ success: false, message: "You don't have permission to access this quiz" });
    }
    res.status(200).json({
        success: true,
        message: "Quiz retrieved successfully",
        data: quizResult.rows[0]
    });
});


export const editQuizQuestion = asyncHandler(async (req, res) => {
    const { question_text, marks, options } = req.body;
    const correct_option_id = req.body.correct_option_id || req.body.correct_answer_id || req.body.correct_answer;
    const instructorId = req.user.sub;
    const course_id = req.params.course_id;
    const question_id = req.params.question_id;

    console.log("Edit quiz request body:", req.body);
    if (!question_id || !question_text || !options || !correct_option_id) {
        return res.status(400).json({ success: false, message: "question_id, question_text, options and correct_option_id are required" });
    }

    let instructorCanEditQuiz = await checkInstructorCanCreateQuizRepository({ course_id, instructorId });

    if (instructorCanEditQuiz.rows.length === 0) {
        return res.status(403).json({ success: false, message: "You don't have permission to edit this quiz" });
    }

    const questionUpdate = await editQuizQuestionRepository({ question_id, question_text, marks, options, correct_option_id });

    if (questionUpdate.rows.length === 0) {
        return res.status(404).json({ success: false, message: "Question not found" });
    }

    return res.status(200).json({
        success: true,
        message: "Quiz question updated successfully",
        data: questionUpdate.rows[0]
    });


})

export const deleteQuizQuestion = asyncHandler(async (req, res) => {
    const question_id = req.params.question_id;
    const course_id = req.params.course_id;
    const instructorId = req.user.sub;
    if (!question_id) {
        return res.status(400).json({ success: false, message: "question_id is required" });
    }
    const isInstructorCanEditQuiz = await checkInstructorCanCreateQuizRepository({ course_id, instructorId });
    if (isInstructorCanEditQuiz.rows.length === 0) {
        return res.status(403).json({ success: false, message: "You don't have permission to delete this question" });
    }
    const deleteResult = await deleteQuizQuestionRepository({ question_id });
    if (deleteResult.rows.length === 0) {
        return res.status(404).json({ success: false, message: "Question not found" });
    }
    return res.status(200).json({
        success: true,
        message: "Question deleted successfully",
        data: deleteResult.rows[0]
    });

})


export const getQuestionsByQuizId = asyncHandler(async (req, res) => {
    const quiz_id = req.params.quiz_id;
    const user_id = req.user.sub;
    const authorization = req.headers.authorization;
    if (!user_id) {
        return res.status(401).json({ success: false, message: "Unauthorized" });
    }
    if (!authorization) {
        return res.status(401).json({ success: false, message: "Authorization header missing" });
    }
    if (!quiz_id) {
        return res.status(400).json({ success: false, message: "quiz_id is required" });
    }


    const questionsResult = await getQuestionsByQuizIdRepository({ quiz_id });
    if (questionsResult.rows.length === 0) {
        return res.status(404).json({ success: false, message: "No questions found for this quiz" });
    }

    const courseIdOfQuiz = questionsResult.rows[0].course_id;

    // allow instructor owner to access quiz questions directly
    const isInstructorOwner = await checkInstructorCanCreateQuizRepository({
        course_id: courseIdOfQuiz,
        instructorId: user_id,
    });
    if (isInstructorOwner.rows.length > 0) {
        return res.status(200).json({
            success: true,
            message: "Questions retrieved successfully",
            data: questionsResult.rows
        });
    }

      let enrolledCourseIds = [];
    try {
        enrolledCourseIds = await getUserEnrolledCoursesRepository({ authorization });
    } catch (error) {
        console.error("Enrollment verification failed in getQuestionsByQuizId:", error?.response?.status, error?.response?.data || error?.message);
        const status = error?.response?.status;
        if (status === 401 || status === 403) {
            return res.status(403).json({ success: false, message: "You don't have permission to access these questions" });
        }
        return res.status(503).json({
            success: false,
            message: "Unable to verify enrollment right now. Please try again."
        });
    }

    if (!Array.isArray(enrolledCourseIds) || !enrolledCourseIds.includes(courseIdOfQuiz)) {
        return res.status(403).json({ success: false, message: "You don't have permission to access these questions" });
    }   
    


    return res.status(200).json({
        success: true,
        message: "Questions retrieved successfully",
        data: questionsResult.rows
    });
}); 