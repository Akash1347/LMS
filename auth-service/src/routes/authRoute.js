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
    getDetails
} from '../controllers/authController.js';

const route = express.Router();

route.post('/register', registerUser);
route.post('/login', loginUser);
route.get('/me', getDetails);
route.post('/logout', logoutUser);
route.patch('/change-password', changePassword);
route.post('/forgot-password', forgotPassword);
route.patch('/reset-password', verifyResetOtp);
route.post('/authenticate', isAuthenticated);
route.post('/send-verification-otp', sendVerificationOtp);
route.post('/verify-otp', verifyOtp);



export default route;
