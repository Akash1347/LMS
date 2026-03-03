import express from "express";
import { authProxy } from "../proxies/auth.proxy.js";
import { authRateLimiter } from "../middleware/rateLimiter.js";
import authenticate from "../middleware/authenticate.js";
import authorize from "../middleware/autthorize.js";


const router = express.Router();

router.use("/register", authRateLimiter);
router.use("/login", authRateLimiter);
router.use('/getDetails', authenticate, authorize('Student'));
router.use('/', authProxy);

export default router;