import { ApiError } from "../utils/ApiError.js";

const authorizeRoles = (...allowedRoles) => {
    return (req, res, next) => {
        if(!req.user){
            throw new ApiError(
                401,
                "Authenication required"
            )
        }

    const userRole = req.user.profile?.role;

    if(!userRole){
        throw new ApiError(
            403,
            "User role not found"
        )
    }

    if(!allowedRoles.includes(userRole)){
        throw new ApiError(
            403,
            "You do not have permission to access this resource"
        )
    }

    next();
    }   
}
export {authorizeRoles};