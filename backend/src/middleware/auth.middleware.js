import {supabase} from "../config/supabase.js";
import {ApiError} from "../utils/ApiError.js";
import {asyncHandler} from "../utils/asyncHandler.js";
import {ApiResponse} from "../utils/ApiResponse.js";

const authenticate = asyncHandler(async(req, res, next) => {
    const authorization = req.headers.authorization;

    if(!authorization || !authorization.startsWith("Bearer")){
        throw new ApiError(
            401,
            "Authentication required"
        );
    }
    const token = authorization.split(" ")[1];

    if(!token){
        throw new ApiError(
            401,
            "Invalid authentication token"
        )
    }
    const {data: {user},error} = await supabase.auth.getUser(token);

    if(error || !user){
        throw new ApiError(
            401,
            "Invalid or expired authentication token"
        );
    }

    const { data: profile, error: profileError} = await supabase
                .from("profiles")
                .select("*")
                .eq("id", user.id)
                .single();

    if(profileError || !profile){
        throw new ApiError(
            404,
            "User profile not found"
        )
    }

    req.user = user;
    req.user.profile = profile;
    next();
})

export {authenticate};