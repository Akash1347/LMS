import pool from "../config/db.js";
import bcrypt from "bcryptjs";
import { generateToken } from "../utils/generateToken.js";
import { publishEvent } from "../queues/publisher.js";
import jwt from "jsonwebtoken";

const getRequesterUserId = (req) => {
    return req.headers['x-user-id'] || req.userId || req.user?.sub;
};

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
        await pool.query(
            'INSERT INTO users (user_name, email, password_hash, role) VALUES ($1, $2, $3, $4)',
            [username, email, hashedPassword, role]
        );

        const userData = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
        const user = userData.rows[0];
        const token = generateToken(user);
        res.setHeader('Authorization', `Bearer ${token}`);

        publishEvent("user.register", "USER_REGISTERED", {
            userId: user.user_id,
            email: user.email,
            name: user.user_name
        });

        return res.status(201).json({
            success: true,
            message: 'User registered successfully',
            token
        });
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
        return res.status(200).json({
            success: true,
            message: 'Login successful',
            token
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ success: false, message: 'Internal server error' });
    }
}

export const getDetails = async (req, res) => {
    const userId = getRequesterUserId(req);
    if (!userId) {
        return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    try {
        const userData = await pool.query(
            'SELECT user_id, user_name, email, role, is_account_verified FROM users WHERE user_id = $1',
            [userId]
        );

        if (userData.rows.length === 0) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        const user = userData.rows[0];
        return res.status(200).json({
            success: true,
            userData: {
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
    const userId = req.headers['x-user-id'];

    if (!userId) {
        return res.status(401).json({ success: false, message: 'Unauthorized' });
    }
    if (!oldPassword || !newPassword) {
        return res.status(400).json({ success: false, message: 'Old and new passwords are required' });
    }

    try {
        const userData = await pool.query('SELECT * FROM users WHERE user_id = $1', [userId]);
        if (userData.rows.length === 0) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        const user = userData.rows[0];
        const isMatch = await bcrypt.compare(oldPassword, user.password_hash);
        if (!isMatch) {
            return res.status(401).json({ success: false, message: 'Old password is incorrect' });
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);
        await pool.query('UPDATE users SET password_hash = $1 WHERE user_id = $2', [hashedPassword, userId]);
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

        const expiresAt = new Date(Date.now() + 15 * 60 * 1000);
        const otp = Math.floor(100000 + Math.random() * 900000);
        await pool.query('UPDATE users SET reset_otp_expires_at = $1, reset_otp = $2 WHERE email = $3', [expiresAt, otp, email]);

        await publishEvent("user.resetOtp", "USER_RESET_OTP", {
            user_id: userData.rows[0].user_id,
            email,
            otp,
            expiresAt
        });

        return res.status(200).json({ success: true, message: 'OTP sent to email' });
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
        await pool.query(
            'UPDATE users SET password_hash = $1, reset_otp = $2, reset_otp_expires_at = $3 WHERE email = $4',
            [hashedPassword, null, null, email]
        );
        return res.status(200).json({ success: true, message: 'Password reset successfully' });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ success: false, message: 'Internal server error' });
    }
}

export const sendVerificationOtp = async (req, res) => {
    const userId = getRequesterUserId(req);
    if (!userId) {
        return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    try {
        const userData = await pool.query('SELECT * FROM users WHERE user_id = $1', [userId]);
        if (userData.rows.length === 0) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        const user = userData.rows[0];
        if (user.is_account_verified) {
            return res.status(400).json({ success: false, message: 'Account already verified' });
        }

        const expiresAt = new Date(Date.now() + 15 * 60 * 1000);
        const otp = Math.floor(100000 + Math.random() * 900000);
        await pool.query('UPDATE users SET verify_otp_expires_at = $1, verify_otp = $2 WHERE user_id = $3', [expiresAt, otp, userId]);

        await publishEvent("user.VerifyOtp", "USER_VERIFY_OTP", {
            user_id: user.user_id,
            email: user.email,
            otp,
            expiresAt
        });

        return res.status(200).json({ success: true, message: 'Verification OTP sent to email'});
    } catch (error) {
        console.error(error);
        return res.status(500).json({ success: false, message: 'Internal server error' });
    }
}

export const verifyOtp = async (req, res) => {
    const { otp } = req.body;
    const userId = getRequesterUserId(req);

    if (!otp) {
        return res.status(400).json({ success: false, message: 'OTP is required' });
    }
    if (!userId) {
        return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    try {
        const userData = await pool.query('SELECT * FROM users WHERE user_id = $1', [userId]);
        if (userData.rows.length === 0) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

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

        await pool.query(
            'UPDATE users SET is_account_verified = $1, verify_otp = $2, verify_otp_expires_at = $3 WHERE user_id = $4',
            [true, null, null, userId]
        );
        return res.status(200).json({ success: true, message: 'Account verified successfully' });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ success: false, message: 'Internal server error' });
    }
}

export const isAuthenticated = async (req, res) => {
    const userId = getRequesterUserId(req);
    if (!userId) {
        return res.status(401).json({ success: false, message: 'Unauthorized' });
    }
    return res.status(200).json({ success: true, message: 'Authenticated' });
}

export const getUserNameById = async (req, res) => {
    const { user_id } = req.params;

    if (!user_id) {
        return res.status(400).json({ success: false, message: 'user_id is required' });
    }

    try {
        const userData = await pool.query(
            'SELECT user_id, user_name FROM users WHERE user_id = $1',
            [user_id]
        );

        if (userData.rows.length === 0) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        const user = userData.rows[0];
        return res.status(200).json({
            success: true,
            data: {
                user_id: user.user_id,
                user_name: user.user_name,
            },
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ success: false, message: 'Internal server error' });
    }
}

 