import express from "express";
import { notificationProxy } from "../proxies/notification.proxy.js";


const router = express.Router();

router.use("/", notificationProxy);

export default router;