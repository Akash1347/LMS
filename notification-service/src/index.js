import dotenv from "dotenv"
dotenv.config();
import express from "express";
import { connectRabbitMq } from "./config/rabbitMq.js";
import { emailVerifyWorker, passwordResetWorker, userCreatedWorker } from "./jobs/worker.js";

const app = express();

const PORT = process.env.PORT || 3006;

// Initialize RabbitMQ connection and start worker
connectRabbitMq().then(() => {
    // Start the user created worker after RabbitMQ connection is established
    userCreatedWorker();
    passwordResetWorker();
    emailVerifyWorker();
}).catch((error) => {
    console.error("Failed to connect to RabbitMQ:", error);
});

app.listen(PORT, (req, res) => {
    console.log(`notification service Running on port ${PORT}`);
})
