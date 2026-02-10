import jwt from 'jsonwebtoken';
import {privateKey} from '../config/keys.js';

export const generateToken = (user) => {
    const payload = {
        sub: user.user_id,
        email: user.email,
        role: user.role
    };
    const options = {
        algorithm: 'RS256',
        expiresIn: '1y', //for 1 year
        issuer: 'auth-service'
    };
    return jwt.sign(payload, privateKey, options);
}