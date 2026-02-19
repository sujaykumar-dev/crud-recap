import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const requireRole= role =>{
    return (req,res,next)=>{
        if(!req.user){
            throw new ApiError(401,"Unauthorized")
        }

        if(req.user.role !== role){
            throw new ApiError(403,"Forbidden: Insufficient Permission!")
        }
        next()
    }
}