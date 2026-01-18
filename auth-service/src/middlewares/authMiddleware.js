
import { readFileSync } from 'fs';
import jwt from 'jsonwebtoken';
const publicKey = readFileSync(new URL('../../src/keys/public.pem', import.meta.url), 'utf8');
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
        const decoded = jwt.verify(token, publicKey, { algorithms: ["RS256"], issuer: "auth-service" });
        req.userId = decoded.sub || decoded.userId;
        next();
    } catch (error) {
        return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

}
