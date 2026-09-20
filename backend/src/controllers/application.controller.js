import { supabase } from "../config/supabase.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const applyForJob = asyncHandler(async (req, res) => {
    const {
        jobId,
        resumeUrl,
        coverLetter
    } = req.body;

    if (!jobId) {
        throw new ApiError(
            400,
            "Job ID is required"
        );
    }

    const {
        data: job,
        error: jobError
    } = await supabase
        .from("jobs")
        .select("id, status, deadline")
        .eq("id", jobId)
        .single();

    if (jobError || !job) {
        throw new ApiError(
            404,
            "job not found"
        )
    }

    if (job.status !== "ACTIVE") {
        throw new ApiError(
            400,
            "This job is not accepting applications"
        )
    }

    if (job.deadline && new Date(job.deadline) < new Date()) {
        throw new ApiError(
            400,
            "Application deadline has passed"
        )
    }

    const { data: existingApplication } = await supabase
        .from("applications")
        .select("id")
        .eq("candidate_id", req.user.id)
        .eq("job_id", jobId)
        .maybeSingle();

    if (existingApplication) {
        throw new ApiError(
            409,
            "You have already applied for this job"
        )
    }

    const {
        data: application,
        error
    } = await supabase
        .from("applications")
        .insert({
            candidate_id: req.user.id,
            job_id: jobId,
            resume_url: resumeUrl,
            cover_letter: coverLetter
        })
        .select("*")
        .single();

    if (error || !application) {
        throw new ApiError(
            400,
            error?.message || "Failed to apply for job"
        )
    }
    return res.status(201).json(
        new ApiResponse(
            201,
            application,
            "Application submitted successfully"
        )
    )
})

const getMyApplications = asyncHandler(async (req, res) => {
    const {
        data: applications, error
    } = await supabase
        .from("applications")
        .select(`
        *,
        jobs (
        id,
        title,
        location,
        job_type,
        work_mode,
        companies (
             id,
             name,
             logo_url
         )
    )
`)
        .eq("candidate_id", req.user.id)
        .order("applied_at", {
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
            applications,
            "Applications fetched successfully"
        )
    )
});

const getApplicationById = asyncHandler(async (req, res) => {
    const {
        id
    } = req.params;
    const {
        data: application,
        error
    } = await supabase
        .from("applications")
        .select(`
            *,
            jobs (
            id,
            title,
            recruiter_id,
            companies (
            id,
            name,
            logo_url
        )
    )
    `)
        .eq("id", id)
        .single();

    if (error || !application) {
        throw new ApiError(
            404,
            "Application not found"
        )
    }

    const isCandidate = application.candidate_id === req.user.id;

    const isRecruiter = application.jobs?.recruiter_id === req.user.id;

    if (!isCandidate && !isRecruiter) {
        throw new ApiError(
            403,
            "You do not have permission to view this application"
        )
    }

    return res.status(200).json(
        new ApiResponse(
            200,
            application,
            "Application fetched successfully"
        )

    )
})

const updateApplicationStatus = asyncHandler(async (req, res) => {
    const {
        id
    } = req.params;

    const {
        status
    } = req.body;

    const allowedStatuses = [
        "UNDER_REVIEW",
        "SHORTLISTED",
        "INTERVIEW",
        "REJECTED",
        "HIRED"
    ];

    if (!allowedStatuses.includes(status)) {
        throw new ApiError(
            400,
            "Invalid application status"
        )
    }

    const {
        data: application,
        error: applicationError
    } = await supabase
        .from("applications")
        .select(`
            *,
            jobs(
            recruiter_id
            )
        `)
        .eq("id", id)
        .single();

    if (applicationError || !application) {
        throw new ApiError(
            404,
            "Application not found"
        )
    }
    if (application.jobs?.recruiter_id !== req.user.id) {
        throw new ApiError(
            403,
            "You can only update applications for your own jobs"
        )
    }

    const { data: updatedApplication, error } = await supabase
        .from("applications")
        .update({
            status,
            updated_at: new Date().toISOString()
        })
        .eq("id", id)
        .select()
        .single();

    if (error || !updatedApplication) {
        throw new ApiError(
            400,
            error?.message || "Failed to update application"
        )
    }

    return res.status(200).json(
        new ApiResponse(
            200,
            updatedApplication,
            "Application status updated successfully"
        )
    )
})

const getRecruiterApplications = asyncHandler(async (req, res) => {
    const {
        data: applications,
        error
    } = await supabase
        .from("applications")
        .select(`
            *,
            profiles: candidate_id(
            id,
            full_name,
            phone,
            location,
            skills,
            education,
            experience_years,
            resume_url
        ),
        jobs(
        id,
        title,
        location,
        job_type,
        work_mode,
        recruiter_id,
        companies(
        id,
        name,
        logo_url
        )
    )
  `)
        .eq("jobs.recruiter_id", req.user.id)
        .order("applied_at", {
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
            applications,
            "Recruiter applications fetched successfully"
        )
    )
})

export { applyForJob, getMyApplications, getApplicationById, updateApplicationStatus, getRecruiterApplications }