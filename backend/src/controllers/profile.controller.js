import { supabase } from "../config/supabase.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const getMyProfile = asyncHandler(async (req, res) => {
    const {
        data: profile,
        error
    } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", req.user.id)
        .single();

    if (error || !profile) {
        throw new ApiError(
            404,
            "Profile not found"
        )
    }
    return res.status(200).json(
        new ApiResponse(
            200,
            profile,
            "Profile fetched successfully"
        )
    )
})

const updateMyProfile = asyncHandler(async (req, res) => {
    const {
        fullName,
        phone,
        location,
        skills,
        education,
        experienceYears,
        resumeUrl,
        profileImageUrl
    } = req.body;

    const updates = {};

    if (fullName !== undefined) {
        updates.full_name = fullName;
    }
    if (phone !== undefined) {
        updates.phone = phone;
    }
    if (location !== undefined) {
        updates.location = location;
    }
    if (skills !== undefined) {
        updates.skills = skills;
    }
    if (education !== undefined) {
        updates.education = education;
    }
    if (experienceYears !== undefined) {
        updates.experience_years = experienceYears;
    }
    if (resumeUrl !== undefined) {
        updates.resume_url = resumeUrl;
    }
    if (profileImageUrl !== undefined) {
        updates.profile_image_url = profileImageUrl;
    }
    if (Object.keys(updates).length === 0) {
        throw new ApiError(
            400,
            "No profile fields provided for update"
        );
    }
    updates.updated_at = new Date().toISOString();

    const { data: profile, error } = await supabase
        .from("profiles")
        .update(updates)
        .eq("id", req.user.id)
        .select("*")
        .single()

    if (error || !profile) {
        throw new ApiError(
            400,
            error?.message || "Failed to update profile"
        )
    }

    return res.status(200).json(
        new ApiResponse(
            200,
            profile,
            "Profile updated successfully"
        )
    )
})
export { getMyProfile, updateMyProfile };