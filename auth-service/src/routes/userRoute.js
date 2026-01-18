import express from "express";
import {  
    getDetails 
} from '../controllers/authController.js';
import { authMiddleware } from "../middlewares/authMiddleware.js";

const route = express.Router();
 
route.get('/me', authMiddleware, getDetails);
 

export default route;