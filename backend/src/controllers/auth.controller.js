import { supabase } from "../config/supabase.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const register = asyncHandler(async(req, res) => {
    const { fullName, email, password } = req.body;

    if(!fullName || !email || !password){
        throw new ApiError(
            400,
            "Full name, email, password are required"
        );
    }
    if(password.length < 0){
        throw new ApiError(
            400,
            "Password must be at least 8 characters long"
        )
    }
    const {data, error} = await supabase.auth.signUp({
        email,
        password,
        options: {
            data: {
                full_name: fullName
            }
        }
    })
    if(error){
        throw new ApiError(
            400,
            error.message
        )
    }
    return res.status(201).json(
        new ApiResponse(
            201,
            {
                user: data.user,
                session: data.session
            },
            "Registration successful"
        )
    )
})

const login = asyncHandler(async(req, res) => {
    const {email, password} = req.body;
    if(!email || !password){
        throw new ApiError(
            400,
            "Email and password are required"
        )
    }
    const {data, error} = await supabase.auth.signInWithPassword({
        email,
        password
    })
    if(error){
        throw new ApiError(
            401,
            "Invalid email or password"
        )
    }
    return res.status(200).json(
        new ApiResponse(
            200,
            {
                user: data.user,
                session: data.session
            },
            "Login successful"
        )
    )
})

const createRecruiter = asyncHandler(async(req, res) => {
    const {
        fullName,
        email,
        password
    } = req.body;

    if(!fullName || !email || !password){
        throw new ApiError(
            400,
            "Full name, email, password are required"
        );
    }

    if(password.length < 0){
       throw new ApiError(
        400,
        "Password must be at least 8 characters"
       )
    }

    const {
        data, 
        error
    } = await supabase.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: {
            full_name: fullName
        }
    })

    if(error){
        throw new ApiError(
            400,
            error.message
        )
    }
    const {error: profileError} = await supabase
          .from("profiles")
          .update({
            role: 'RECRUITER'
          })
          .eq("id", data.user.id);

    if(profileError){
        throw new ApiError(
            400,
            profileError.message
        )
    }

    return res.status(201).json(
        new ApiResponse(
            201,
            {
                userId: data.user.id,
                email: data.user.email,
                role: "RECRUITER"
            },
            "Recruiter created successfully"
        )
    )
}) 

export { register, login, createRecruiter };