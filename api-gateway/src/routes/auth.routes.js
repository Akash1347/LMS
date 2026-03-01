import express from "express";
import { authProxy } from "../proxies/auth.proxy.js";
import { authRateLimiter } from "../middleware/rateLimiter.js";


const router = express.Router();

router.use("/register", authRateLimiter);
router.use("/login", authRateLimiter);
router.use('/', authProxy);

export default router;