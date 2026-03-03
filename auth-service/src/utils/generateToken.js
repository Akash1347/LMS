import jwt from 'jsonwebtoken';

export const generateToken = (user) => {
    const payload = {
        sub: user.user_id,
        email: user.email,
        username: user.user_name,
        role: user.role
    };
    const secret = process.env.JWT_SECRET;
    const options = {
        algorithm: 'HS256',
        expiresIn: '1y',
        issuer: 'auth-service'
    };


    return jwt.sign(payload, secret, options);
}