import express from "express";
import cors from "cors";
import env from "./config/env.js";
import logger from "./logger.js";

import courseRoute from "./routes/course.routes.js";
import authRoute from "./routes/auth.routes.js";
import enrollmentRoute from "./routes/enrollment.routes.js";
import notificationRoute from "./routes/notification.routes.js";

import { globalRateLimiter } from "./middleware/rateLimiter.js";



const app = express();
const PORT = env.PORT || 3000;


app.use(
  cors({
    origin: true,
    credentials: true,
  })
);
app.use(express.json());

app.use((req, res, next) => {
    const start = Date.now();
    res.on("finish", () => {
        const duration = Date.now() - start;
        logger.info({
            event: "http_request",
            method: req.method,
            url: req.originalUrl,
            status: res.statusCode,
            durationMs: `${duration} Ms`,
            ip: req.ip,
        });
    });
    next();
});

app.use(globalRateLimiter);


app.use("/api/course", courseRoute);
app.use("/api/auth", authRoute);
app.use("/api/enrollment", enrollmentRoute);
app.use("/api/notification", notificationRoute);


app.get("/health", (req, res) => {
    res.status(200).json({ status: "OK" });
})

app.use((err, req, res, next) => {
    logger.error({
        event: "unhandled_error",
        method: req?.method,
        url: req?.originalUrl,
        message: err?.message,
        stack: err?.stack,
    });
    res.status(500).json({ error: "Internal Server Error" });

})

app.listen(PORT, () => {
    logger.info({
        event: "gateway_started",
        port: PORT,
        nodeEnv: env.NODE_ENV || "development",
    });
});