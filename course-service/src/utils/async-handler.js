import logger from "../config/logger.config.js";

function asyncHandler(fn){
    return async function(req, res, next){
        try{
            const result = await fn(req, res, next);
            return result;
        }catch (error) {
            logger.error({
                event: "async_handler_error",
                method: req?.method,
                url: req?.originalUrl,
                message: error?.message,
                stack: error?.stack,
            });
            res.status(500).json({
                success: false,
                message: "Internal server error"
            });
        }
    };
}

export default asyncHandler;


