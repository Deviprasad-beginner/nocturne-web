import multer from "multer";
import path from "path";
import { Request } from "express";

// Configure storage
const storage = multer.memoryStorage(); // Store in memory for processing

// File filter
const fileFilter = (
    req: Request,
    file: Express.Multer.File,
    cb: multer.FileFilterCallback
) => {
    const allowedTypes = [
        "application/pdf",
        "text/plain",
        "application/txt",
    ];

    const allowedExtensions = [".pdf", ".txt"];
    const ext = path.extname(file.originalname).toLowerCase();

    if (allowedTypes.includes(file.mimetype) || allowedExtensions.includes(ext)) {
        cb(null, true);
    } else {
        cb(new Error("Only PDF and TXT files are allowed"));
    }
};

// Multer configuration
export const uploadMiddleware = multer({
    storage,
    fileFilter,
    limits: {
        fileSize: 10 * 1024 * 1024, // 10MB limit
    },
});

// Single file upload field
export const uploadSingle = uploadMiddleware.single("file");
