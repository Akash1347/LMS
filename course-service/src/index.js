import "./config/env.js"
import express from "express";

import courseRoutes from "./routes/courseRoute.js";

const app = express();
const PORT = process.env.PORT || 3001;

// Add middleware to parse JSON bodies
app.use(express.json());

// Add middleware to parse URL-encoded bodies (for form data)
app.use(express.urlencoded({ extended: true }));

app.get("/", (req, res) => {
    res.send("Course Service - Hello World!");
});

app.use('/api/course', courseRoutes);

app.listen(PORT, () => {
    console.log(`Course service running on port ${PORT}`);
});
