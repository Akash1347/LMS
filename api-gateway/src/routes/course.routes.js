import express from "express";
import { courseProxy } from "../proxies/course.proxy.js";


const router = express.Router();

router.use("/", courseProxy);

export default router;