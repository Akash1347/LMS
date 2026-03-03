import jwt from 'jsonwebtoken';

export const authMiddleware = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    if(!authHeader){
        return res.status(401).json({ success: false, message: 'Unauthorized' });
    }
    const token = authHeader.split(' ')[1];
    if(!token){
        return res.status(401).json({ success: false, message: 'Unauthorized' });
    }
    try {
        const secret = process.env.JWT_SECRET || 'jnsi2udnbhdjnwk';
        const decoded = jwt.verify(token, secret, { algorithms: ["HS256"], issuer: "auth-service" });
        req.userId = decoded.sub || decoded.userId;
        req.user = decoded;
        next();
    } catch (error) {
        return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

}
