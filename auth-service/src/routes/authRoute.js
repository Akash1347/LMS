import express from "express";
import {
    registerUser,
    loginUser,
    logoutUser,
    changePassword,
    forgotPassword,
    verifyResetOtp,
    sendVerificationOtp,
    verifyOtp,
    isAuthenticated,
    authWithJwtRegister,
    getUserDetailsForJwt
} from '../controllers/authController.js';
import { authMiddleware } from "../middlewares/authMiddleware.js";

const route = express.Router();

route.post('/register', registerUser);
route.post('/login', loginUser);
//route.get('/me', authMiddleware, getDetails);
route.post('/logout', logoutUser);
route.patch('/change-password', authMiddleware, changePassword);
route.post('/forgot-password', forgotPassword);
route.patch('/reset-password', verifyResetOtp);
route.post('/authenticate', authMiddleware, isAuthenticated);
route.post('/send-verification-otp', authMiddleware, sendVerificationOtp);
route.post('/verify-otp', authMiddleware, verifyOtp);
route.post('/auth-with-jwt-register', authWithJwtRegister);
route.get('/getDetails', getUserDetailsForJwt);


export default route;
