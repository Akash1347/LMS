import express from "express";
import { authProxy } from "../proxies/auth.proxy.js";
import { authRateLimiter } from "../middleware/rateLimiter.js";
import authenticate from "../middleware/authenticate.js";
import authorize from "../middleware/autthorize.js";



const router = express.Router();

router.use("/register", authRateLimiter);
router.use("/login", authRateLimiter);
router.use('/me', authenticate);
router.use('/getDetails', authenticate);
router.use('/change-password', authenticate);
router.use('/authenticate', authenticate);
router.use('/send-verification-otp', authenticate);
router.use('/verify-otp', authenticate);
 
router.use('/', authProxy);

export default router;