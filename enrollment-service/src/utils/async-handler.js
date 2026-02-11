function asyncHandler(fn) {
     return async function(req, res, next) {
        try{
            const result = await fn(req, res, next);
            return result;
        }catch(err){
            console.error("Error in async handler:", err);
            res.status(500).json({
                success: false,
                message: "Internal server error"
            });
        }
     }
};

export default asyncHandler;