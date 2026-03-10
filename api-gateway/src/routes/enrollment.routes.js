import express from "express";
import { enrollmentProxy } from "../proxies/enrollment.proxy.js";
import authenticate from "../middleware/authenticate.js";
import authorize from "../middleware/autthorize.js";


const router = express.Router();

router.use('/my-enrollments', authenticate, authorize("Student"))
router.use('/enroll', authenticate, authorize("Student"));
router.use('/enrolled/:courseId', authenticate, authorize("Student"));
router.get('/analytics/:courseId', enrollmentProxy);



router.use("/", enrollmentProxy);

export default router;