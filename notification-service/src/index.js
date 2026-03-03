import express from "express";
import "./config/env.config.js";
import logger from "./config/logger.config.js";
import { start } from "./server.js";

const app = express();

const PORT = process.env.PORT || 3006;
await start();
app.listen(PORT, () => {
    logger.info({ event: "service_started", port: String(PORT), nodeEnv: process.env.NODE_ENV || "development" });
})
