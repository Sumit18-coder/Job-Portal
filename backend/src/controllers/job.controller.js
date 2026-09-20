import { supabase } from "../config/supabase.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const createJob = asyncHandler(async (req, res) => {
    const {
        title,
        description,
        companyId,
        location,
        salaryMin,
        salaryMax,
        experienceMin,
        experienceMax,
        jobType,
        workMode,
        skills,
        deadline,
        status
    } = req.body;

    if (
        !title ||
        !description ||
        !companyId ||
        !jobType ||
        !workMode
    ) {
        throw new ApiError(
            400,
            "title, description, companyId, jobType and workMode are required"
        )
    }

    const allowedJobTypes = [
        "FULL_TIME",
        "PART_TIME",
        "CONTRACT",
        "INTERNSHIP"
    ];

    const allowedWorkModes = [
        "ONSITE",
        "HYBRID",
        "REMOTE"
    ];

    if (!allowedJobTypes.includes(jobType)) {
        throw new ApiError(
            400,
            "Invalid job type"
        );
    }

    if (!allowedWorkModes.includes(workMode)) {
        throw new ApiError(
            400,
            "Invalid work mode"
        );
    }

    const allowedStatuses = [
        "DRAFT",
        "ACTIVE",
        "CLOSED"
    ];

    if (
        status !== undefined &&
        !allowedStatuses.includes(status)
    ) {
        throw new ApiError(
            400,
            "Invalid job status"
        );
    }

    if (
        salaryMin !== undefined &&
        salaryMin !== null &&
        salaryMin < 0
    ) {
        throw new ApiError(
            400,
            "Minimum salary cannot be negative"
        );
    }

    if (
        salaryMax !== undefined &&
        salaryMax !== null &&
        salaryMax < 0
    ) {
        throw new ApiError(
            400,
            "Maximum salary cannot be negative"
        );
    }

    if (
        salaryMin !== undefined &&
        salaryMax !== undefined &&
        salaryMin !== null &&
        salaryMax !== null &&
        salaryMin > salaryMax
    ) {
        throw new ApiError(
            400,
            "Minimum salary cannot exceed maximum salary"
        );
    }

    if (
        experienceMin !== undefined &&
        experienceMin !== null &&
        experienceMin < 0
    ) {
        throw new ApiError(
            400,
            "Minimum experience cannot be negative"
        );
    }

    if (
        experienceMax !== undefined &&
        experienceMax !== null &&
        experienceMax < 0
    ) {
        throw new ApiError(
            400,
            "Maximum experience cannot be negative"
        );
    }

    if (
        experienceMin !== undefined &&
        experienceMax !== undefined &&
        experienceMin !== null &&
        experienceMax !== null &&
        experienceMin > experienceMax
    ) {
        throw new ApiError(
            400,
            "Minimum experience cannot exceed maximum experience"
        );
    }
    const { data: company, error: companyError } = await supabase
        .from("companies")
        .select("id, recruiter_id")
        .eq("id", companyId)
        .single();

    if (companyError || !company) {
        throw new ApiError(
            404,
            "Company not found"
        )
    }

    if (company.recruiter_id !== req.user.id) {
        throw new ApiError(
            403,
            "you can only create jobs for your own company"
        );
    }

    const { data: job, error } = await supabase
        .from("jobs")
        .insert({
            title,
            description,
            company_id: companyId,
            recruiter_id: req.user.id,
            location,
            salary_min: salaryMin,
            salary_max: salaryMax,
            experience_min: experienceMin ?? 0,
            experience_max: experienceMax,
            job_type: jobType,
            work_mode: workMode,
            skills: skills ?? [],
            deadline,
            status: status ?? "DRAFT"
        })
        .select("*")
        .single();

    if (error || !job) {
        throw new ApiError(
            400,
            error?.message || "Failed to create job"
        );
    }

    return res.status(201).json(
        new ApiResponse(
            201,
            job,
            "Job created successfully"
        )
    );
})
const getJobs = asyncHandler(async (req, res) => {
    const { data: jobs, error } = await supabase
        .from("jobs")
        .select(`
            *,
            companies(
                id,
                name,
                logo_url,
                location
            )
        `)
        .order("created_at", {
            ascending: false
        })

    if (error) {
        throw new ApiError(
            400,
            error.message
        )
    }

    return res.status(200).json(
        new ApiResponse(
            200,
            jobs,
            "Jobs fetched successfully"
        )
    )
})

const getJobById = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { data: job, error } = await supabase
        .from("jobs")
        .select(`
            *,
            companies(
            id,
            name,
            description,
            website,
            logo_url,
            location
        )
    `)
        .eq("id", id)
        .single();

    if (error || !job) {
        throw new ApiError(
            404,
            "Job not found"
        )
    }

    return res.status(200).json(
        new ApiResponse(
            200,
            job,
            "Job fetched successfully"
        )
    )
})

export { createJob, getJobs, getJobById };