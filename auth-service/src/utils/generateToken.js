import jwt from 'jsonwebtoken';

export const generateToken = (user) => {
    const payload = {
        sub: user.user_id,
        email: user.email,
        role: user.role
    };
    const secret = process.env.JWT_SECRET || 'jnsi2udnbhdjnwk';
    const options = {
        algorithm: 'HS256',
        expiresIn: '1y', //for 1 year
        issuer: 'auth-service'
    };
    return jwt.sign(payload, secret, options);
}