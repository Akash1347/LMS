import "./config/env.config.js"
import express from "express";
import multer from "multer";

import courseRoutes from "./routes/courseRoute.js";
import { connectRabbitMq } from "./config/rabbitMq.config.js";
import logger from "./config/logger.config.js";
import env from "./config/env.config.js";
const app = express();
const PORT = env.PORT || 3001;

 
app.use(express.json({limit: '10mb',strict: true}));
app.use(express.urlencoded({ extended: true, limit: '10mb'}));

app.use((req, res, next) => {
    const start = Date.now();
    res.on("finish", () => {
        const duration = Date.now() - start;
        logger.info({
            event: "http_request",
            method: req.method,
            url: req.originalUrl,
            status: res.statusCode,
            durationMs: `${duration}ms`,
            ip: req.ip,
        });
    });
    next();
});

await connectRabbitMq().
then(() => {
    logger.info({
        event: "rabbitmq_connected",
        url: env.RABBITMQ_URL,
    });
})
.catch((err) => {
    logger.error({
        event: "rabbitmq_connection_error",
        url: env.RABBITMQ_URL,
        message: err.message,
        stack: err.stack,
    });
    process.exit(1);
});



app.get("/health", (req, res) => {
    res.status(200).json({ status: "OK" });
});

app.use('/api/course', courseRoutes);


// Global error handler for JSON parsing errors
app.use((err, req, res, next) => {
    if (err instanceof multer.MulterError) {
        if (err.code === "LIMIT_FILE_SIZE") {
            return res.status(413).json({
                success: false,
                message: "File too large. Please upload a smaller file.",
            });
        }
        return res.status(400).json({
            success: false,
            message: err.message || "Invalid file upload",
        });
    }

    if (err?.message?.includes("Unsupported file type")) {
        return res.status(415).json({
            success: false,
            message: err.message,
        });
    }

    if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
        logger.error({
            event: "json_parse_error",
            url: req.url,
            method: req.method,
            error: err.message,
            position: err.position
        });
        return res.status(400).json({
            success: false,
            message: "Invalid JSON format in request body",
            error: err.message,
            details: "Please check your JSON syntax and ensure it's properly formatted"
        });
    }
    logger.error({
        event: "unhandled_error",
        method: req?.method,
        url: req?.originalUrl,
        error: err?.message,
        stack: err?.stack,
    });
    res.status(500).json({
        success: false,
        message: "Internal server error",
    });
    next();
});

app.listen(PORT, () => {
    logger.info({
        event: "server_started",
        port: PORT,
        nodeEnv: env.NODE_ENV || "development",


    });
});
