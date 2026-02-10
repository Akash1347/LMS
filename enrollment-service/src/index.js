import express from "express";
import "./config/env.js";
import { connectRabbitMq } from "./config/rabbitMq.js";
import { initEvents } from "./events/event-handler.js";
const app = express();
const PORT = process.env.PORT || 3004;

await connectRabbitMq();
await initEvents();
app.get("/", (req, res) => {
    res.send("Enrollment Service - Hello World!");
});


app.listen(PORT, () => {
    console.log(`Enrollment service running on port ${PORT}`);
});
