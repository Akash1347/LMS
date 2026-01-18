import pool from "../config/db.js";
import bcrypt from "bcryptjs";
import { generateToken } from "../utils/generateToken.js";

export const registerUser = async (req, res) => {
    const { username, email, password, role } = req.body;

    if (!username || !email || !password || !role) {
        return res.status(400).json({ success: false, message: 'All fields are required' });
    }
    try {
        const existingUser = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
        if (existingUser.rows.length > 0) {
            return res.status(409).json({ success: false, message: 'User already exists' });
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        await pool.query('INSERT INTO users (user_name, email, password_hash, role) VALUES ($1, $2, $3, $4)', [username, email, hashedPassword, role]);

        const userData = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
        const user = userData.rows[0];
        const token = generateToken(user);
        res.setHeader('Authorization', `Bearer ${token}`);
        // res.cookie('token', token, { 
        //     httpOnly: true, 
        //     secure: process.env.NODE_ENV === 'production',
        // sameSite: process.env.NODE_ENV === 'production' ? 'None' : 'Lax',
        //     maxAge: 24 * 60 * 60 * 1000 
        // });
        return res.status(201).json({ success: true, message: 'User registered successfully' });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ success: false, message: 'Internal server error' });
    }
}

export const loginUser = async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
        return res.status(400).json({ success: false, message: 'Email and password are required' });
    }
    try {
        const userData = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
        if (userData.rows.length === 0) {
            return res.status(401).json({ success: false, message: 'Invalid email or password' });
        }
        const user = userData.rows[0];
        const isMatch = await bcrypt.compare(password, user.password_hash);
        if (!isMatch) {
            return res.status(401).json({ success: false, message: 'Invalid email or password' });
        }
        const token = generateToken(user);
        res.setHeader('Authorization', `Bearer ${token}`);
        return res.status(200).json({ success: true, message: 'Login successful' });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ success: false, message: 'Internal server error' });
    }
}

export const getDetails = async (req, res) => {
    if (!req.userId) {
        return res.status(401).json({ success: false, message: 'Unauthorized' });
    }
    try {
        const userData = await pool.query('SELECT user_id, user_name, email, role, is_account_verified FROM users WHERE user_id = $1', [req.userId]);
        const user = userData.rows[0];
        return res.status(200).json({
            success: true, userData: {
                user_id: user.user_id,
                user_name: user.user_name,
                email: user.email,
                role: user.role,
                account_verified: user.is_account_verified
            }
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ success: false, message: 'Internal server error' });
    }
}

export const logoutUser = async (req, res) => {

    if (!req.headers['authorization']) {
        return res.status(401).json({ success: false, message: 'Unauthorized' });
    }
    res.setHeader('Authorization', '');
    return res.status(200).json({ success: true, message: 'Logout successful' });
}

export const changePassword = async (req, res) => {
    const { oldPassword, newPassword } = req.body;

    if (!req.userId) {
        return res.status(401).json({ success: false, message: 'Unauthorized' });
    }
    if (!oldPassword || !newPassword) {
        return res.status(400).json({ success: false, message: 'Old and new passwords are required' });
    }
    try {
        const userData = await pool.query('SELECT * FROM users WHERE user_id = $1', [req.userId]);
        const user = userData.rows[0];
        const isMatch = await bcrypt.compare(oldPassword, user.password_hash);
        if (!isMatch) {
            return res.status(401).json({ success: false, message: 'Old password is incorrect' });
        }
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        await pool.query('UPDATE users SET password_hash = $1 WHERE user_id = $2', [hashedPassword, req.userId]);
        return res.status(200).json({ success: true, message: 'Password changed successfully' });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ success: false, message: 'Internal server error' });
    }
}

export const forgotPassword = async (req, res) => {
    const { email } = req.body;

    if (!email) {
        return res.status(400).json({ success: false, message: 'Email is required' });
    }
    try {
        const userData = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
        if (userData.rows.length === 0) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }
        const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes from now
        const otp = Math.floor(100000 + Math.random() * 900000);
        await pool.query('UPDATE users SET reset_otp_expires_at = $1, reset_otp = $2 WHERE email = $3', [expiresAt, otp, email]);
        return res.status(200).json({ success: true, message: 'OTP sent to email', data: { expiresAt, otp } });
        //event send-notification for user to reset password from notification service 
    } catch (error) {
        console.error(error);
        return res.status(500).json({ success: false, message: 'Internal server error' });
    }
}

export const verifyResetOtp = async (req, res) => {
    const { email, otp, newPassword } = req.body;
    if (!email || !otp || !newPassword) {
        return res.status(400).json({ success: false, message: 'Email, OTP, and new password are required' });
    }
    try {
        const userData = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
        if (userData.rows.length === 0) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }
        const user = userData.rows[0];
        if (!user.reset_otp_expires_at || Date.now() > new Date(user.reset_otp_expires_at).getTime()) {
            return res.status(400).json({ success: false, message: 'OTP has expired' });
        }
        if (!user.reset_otp || user.reset_otp != otp) {
            return res.status(400).json({ success: false, message: 'Invalid OTP' });
        }
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        await pool.query('UPDATE users SET password_hash = $1, reset_otp = $2, reset_otp_expires_at = $3 WHERE email = $4', [hashedPassword, null, null, email]);
        return res.status(200).json({ success: true, message: 'Password reset successfully' });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ success: false, message: 'Internal server error' });
    }
}

export const sendVerificationOtp = async (req, res) => {
    if (!req.userId) {
        return res.status(401).json({ success: false, message: 'Unauthorized' });
    }
    try {
        const userData = await pool.query('SELECT * FROM users WHERE user_id = $1', [req.userId]);
        const user = userData.rows[0];
        if (user.is_account_verified) {
            return res.status(400).json({ success: false, message: 'Account already verified' });
        }
        const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes from now
        const otp = Math.floor(100000 + Math.random() * 900000);
        await pool.query('UPDATE users SET verify_otp_expires_at = $1, verify_otp = $2 WHERE user_id = $3', [expiresAt, otp, req.userId]);
        return res.status(200).json({ success: true, message: 'Verification OTP sent to email' ,data:{otp:otp, expiresAt:expiresAt}});
        //event send-notification for user to verify account from notification service
    } catch (error) {
        console.error(error);
        return res.status(500).json({ success: false, message: 'Internal server error' });
    }
}

export const verifyOtp = async (req, res) => {
    const { otp } = req.body;
    if (!otp) {
        return res.status(400).json({ success: false, message: 'OTP is required' });
    }
    if (!req.userId) {
        return res.status(401).json({ success: false, message: 'Unauthorized' });
    }
    try {
        const userData = await pool.query('SELECT * FROM users WHERE user_id = $1', [req.userId]);
        const user = userData.rows[0];
        if (user.is_account_verified) {
            return res.status(400).json({ success: false, message: 'Account already verified' });
        }
        if (!user.verify_otp_expires_at || Date.now() > new Date(user.verify_otp_expires_at).getTime()) {
            return res.status(400).json({ success: false, message: 'OTP has expired' });
        }
        if (!user.verify_otp || user.verify_otp != otp) {
            return res.status(400).json({ success: false, message: 'Invalid OTP' });
        }
        await pool.query('UPDATE users SET is_account_verified = $1, verify_otp = $2, verify_otp_expires_at = $3 WHERE user_id = $4', [true, null, null, req.userId]);
        return res.status(200).json({ success: true, message: 'Account verified successfully' });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ success: false, message: 'Internal server error' });
    }
}

export const isAuthenticated = async (req, res) => {
    try {
        return res.json({ success: true, message: "User Authenticated" });
    } catch (err) {
        return res.json({ success: false, message: err.message });

    }
}
