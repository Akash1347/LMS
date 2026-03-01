import express from "express";
import { enrollmentProxy } from "../proxies/enrollment.proxy.js";


const router = express.Router();

router.use("/", enrollmentProxy);

export default router;