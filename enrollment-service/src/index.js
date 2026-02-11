import express from "express";
import "./config/env.js";
import { connectRabbitMq } from "./config/rabbitMq.js";
import { initEvents } from "./events/event-handler.js";

import enrollmentRoute from "./routes/enrollmentRoute.js";
const app = express();

// Add body parser middleware to parse JSON request bodies
app.use(express.json());
const PORT = process.env.PORT || 3002;

await connectRabbitMq();
await initEvents();
app.get("/", (req, res) => {
    res.send("Enrollment Service - Hello World!");
});

app.use('/api/enrollment', enrollmentRoute);
app.listen(PORT, () => {
    console.log(`Enrollment service running on port ${PORT}`);
});
