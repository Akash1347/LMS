import { v2 as cloudinary } from "cloudinary";
import multer from "multer";
import streamifier from "streamifier";
import dotenv from "dotenv";
dotenv.config();

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const LESSON_MAX_FILE_SIZE_MB = Number(process.env.LESSON_MAX_FILE_SIZE_MB || 50)
const LESSON_MAX_FILE_SIZE_BYTES = LESSON_MAX_FILE_SIZE_MB * 1024 * 1024

const lessonFileFilter = (_req, file, cb) => {
  const allowed = [
    "video/mp4",
    "video/webm",
    "video/ogg",
    "video/quicktime",
    "application/pdf",
    "image/png",
    "image/jpeg",
    "image/jpg",
    "image/webp",
  ]

  if (!allowed.includes(file.mimetype)) {
    return cb(new Error("Unsupported file type. Use MP4/WebM/OGG/MOV, PDF, PNG, JPG, or WEBP."))
  }

  cb(null, true)
}

// Multer: store file in memory + enforce file limits early
export const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: LESSON_MAX_FILE_SIZE_BYTES },
  fileFilter: lessonFileFilter,
}).single("file");

// Upload helper: auto-detect resource type (image/video/raw)
export function uploadToCloudinary(buffer, options = {}) {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        resource_type: "auto", // critical: lets Cloudinary decide (pdf -> raw)
        use_filename: true,
        unique_filename: true,
        ...options,
      },
      (err, result) => {
        if (err) return reject(err);
        resolve(result);
      }
    );

    streamifier.createReadStream(buffer).pipe(uploadStream);
  });
}
