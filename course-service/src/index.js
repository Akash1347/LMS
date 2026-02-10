import "./config/env.js"
import express from "express";

import courseRoutes from "./routes/courseRoute.js";
import { connectRabbitMq } from "./config/rabbitMqConfig.js";
const app = express();
const PORT = process.env.PORT || 3001;

// Add middleware to parse JSON bodies with error handling
app.use(express.json({
    limit: '10mb',
    strict: true
}));

// Add middleware to parse URL-encoded bodies (for form data)
app.use(express.urlencoded({
    extended: true,
    limit: '10mb'
}));

// Global error handler for JSON parsing errors
app.use((err, req, res, next) => {
    if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
        console.error("JSON parsing error details:", {
            url: req.url,
            method: req.method,
            body: req.body,
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
    next();
});


await connectRabbitMq();
app.get("/", (req, res) => {
    res.send("Course Service - Hello World!");
});

app.use('/api/course', courseRoutes);

app.listen(PORT, () => {
    console.log(`Course service running on port ${PORT}`);
});
