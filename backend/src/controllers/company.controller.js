import { compareSync } from "bcryptjs";
import { supabase } from "../config/supabase.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const createCompany = asyncHandler(async(req, res) => {
    const {
        name,
        description,
        website,
        logoUrl,
        location
    } = req.body;

    if(!name){
        throw new ApiError(
            400,
            "Company name is required"
        )
    }

    const {data: company, error} = await supabase
        .from("companies")
        .insert({
            name,
            description,
            website,
            logo_url: logoUrl,
            location,
            recruiter_id : req.user.id
        })
        .select("*")
        .single();

    if(error || !company){
        throw new ApiError(
            400,
            error?.message || "failed to create company"
        )
    }

    return res.status(201).json(
        new ApiResponse(
            201,
            company,
            "Company created successfully"
        )
    )
})

const getCompanies = asyncHandler(async(req, res) => {
    const {data: companies, error} = await supabase
          .from("companies")
          .select("*")
          .order("created_at", {
            ascending: false
          })
    if(error){
        throw new ApiError(
            400,
            error.message
        )
    }
    return res.status(200).json(
        new ApiResponse(
            200,
            companies,
            "Companies fetched successfully"
        )
    )
})

export {createCompany, getCompanies};