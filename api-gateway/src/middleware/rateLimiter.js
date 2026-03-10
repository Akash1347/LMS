import { RateLimiterMemory } from "rate-limiter-flexible";
import logger from "../logger.js";
import env from "../config/env.js";

const globalLimiterConfig = new RateLimiterMemory({
    points: Number(env.GLOBAL_RATE_LIMIT_POINTS || 300),
    duration: Number(env.GLOBAL_RATE_LIMIT_DURATION || 60),
});

const authLimiterConfig = new RateLimiterMemory({
    points: Number(env.AUTH_RATE_LIMIT_POINTS || 10),
    duration: Number(env.AUTH_RATE_LIMIT_DURATION || 60 * 3),
})

const getLimiterKey = (req) => {
    const forwardedFor = req.headers["x-forwarded-for"];
    if (typeof forwardedFor === "string" && forwardedFor.length > 0) {
        return forwardedFor.split(",")[0].trim();
    }
    return req.ip;
};

const getGlobalCost = (req) => {
    if (req.method === "GET") return 1;
    if (req.method === "POST") return 2;
    return 3;
};

export const globalRateLimiter = async(req, res, next) => {
    try{
        const key = getLimiterKey(req);
        const pointsToConsume = getGlobalCost(req);
        await globalLimiterConfig.consume(key, pointsToConsume);
        next();
    } catch (rejRes) {
        const retryAfterSeconds = Math.ceil((rejRes?.msBeforeNext || 1000) / 1000);
        logger.warn({
            event: "rate_limit_blocked_global",
            method: req.method,
            url: req.originalUrl,
            ip: getLimiterKey(req),
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
        await authLimiterConfig.consume(getLimiterKey(req));
        next();
    } catch (rejRes) {
        const retryAfterSeconds = Math.ceil((rejRes?.msBeforeNext || 1000) / 1000);
        logger.warn({
            event: "rate_limit_blocked_auth",
            method: req.method,
            url: req.originalUrl,
            ip: getLimiterKey(req),
            retryAfterSeconds,
        });
        res.set("Retry-After", String(retryAfterSeconds));
        res.status(429).json({success: false,
            message: "Too many authentication requests. Please try again later."
        });
    }
};