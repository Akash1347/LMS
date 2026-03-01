import { RateLimiterMemory } from "rate-limiter-flexible";
import logger from "../logger.js";

const globalLimiterConfig = new RateLimiterMemory({
    points: 10, // 100 requests
    duration: 60, // per 60 seconds by IP
});

const authLimiterConfig = new RateLimiterMemory({
    points: 5, // 5 requests
    duration: 60*3, // per 60 seconds by IP
})

export const globalRateLimiter = async(req, res, next) => {
    try{
        await globalLimiterConfig.consume(req.ip);
        next();
    } catch (rejRes) {
        const retryAfterSeconds = Math.ceil((rejRes?.msBeforeNext || 1000) / 1000);
        logger.warn({
            event: "rate_limit_blocked_global",
            method: req.method,
            url: req.originalUrl,
            ip: req.ip,
            retryAfterSeconds,
        });
        res.set("Retry-After", String(retryAfterSeconds));
        res.status(429).json({success: false,
            message: "Too many requests. Please try again later."
        });
    }
};

export const authRateLimiter = async(req, res, next) => {
    try{
        await authLimiterConfig.consume(req.ip);
        next();
    } catch (rejRes) {
        const retryAfterSeconds = Math.ceil((rejRes?.msBeforeNext || 1000) / 1000);
        logger.warn({
            event: "rate_limit_blocked_auth",
            method: req.method,
            url: req.originalUrl,
            ip: req.ip,
            retryAfterSeconds,
        });
        res.set("Retry-After", String(retryAfterSeconds));
        res.status(429).json({success: false,
            message: "Too many authentication requests. Please try again later."
        });
    }
};