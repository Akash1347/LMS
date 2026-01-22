import dotenv from "dotenv"
dotenv.config();
console.log('DATABASE_URL:', process.env.DATABASE_URL);
import express from "express";
import { start } from "./server.js";

const app = express();

const PORT = process.env.PORT || 3006;
await start();
app.listen(PORT, () => {
    console.log(`notification service Running on port ${PORT}`);
})
