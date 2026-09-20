import { supabase } from "../config/supabase.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const saveJob = asyncHandler(async(req, res) => {
    const {jobId} = req.body;

    if(!jobId){
        throw new ApiError(
            400,
            "Job ID is required"
        )
    }
    //verify if job exist
    const {
        data: job,
        error: jobError
    } = await supabase
        .from("jobs")
        .select("id")
        .eq("id", jobId)
        .maybeSingle();

    if(jobError){
        throw new ApiError(
            400,
            jobError.message
        )
    }

    if(!job){
        throw new ApiError(
            404,
            "Job not found"
        )
    }

    //check if already saved
    const {
        data: existingSave,
        error: existingError
    } = await supabase
        .from("saved_jobs")
        .select("id")
        .eq("candidate_id", req.user.id)
        .eq("job_id", jobId)
        .maybeSingle();

    if(existingError){
        throw new ApiError(
            400,
            existingError.message
        )
    }

    if(existingSave){
        throw new ApiError(
            409,
            "Job is already saved"
        )
    }

    const {data: savedJobs, error} = await supabase
         .from("saved_jobs")
         .insert({
            candidate_id: req.user.id,
            job_id: jobId
         })
         .select("*")
         .single();

    if(error){
        throw new ApiError(
            400,
            error.message
        )
    }
    return res.status(201).json(
       new ApiResponse(
        201,
        saveJob,
        "Job saved successfully"
       )
    )
})

const getSavedJobs = asyncHandler(async (req, res) => {
    const {
        data: savedJobs,
        error
    } = await supabase
        .from("saved_jobs")
        .select(`
            id,
            saved_at,
            job_id,
            jobs (
                id,
                title,
                description,
                location,
                salary_min,
                salary_max,
                experience_min,
                experience_max,
                job_type,
                work_mode,
                skills,
                deadline,
                status,
                company_id,
                companies (
                    id,
                    name,
                    logo_url,
                    location
                )
            )
        `)
        .eq("candidate_id", req.user.id)
        .order("saved_at", {
            ascending: false
        });

    if (error) {
        throw new ApiError(
            400,
            error.message
        );
    }

    return res.status(200).json(
        new ApiResponse(
            200,
            savedJobs,
            "Saved jobs fetched successfully"
        )
    );
});


const removeSavedJob = asyncHandler(async (req, res) => {
    const { jobId } = req.params;

    if (!jobId) {
        throw new ApiError(
            400,
            "Job ID is required"
        );
    }

    const {
        data: savedJob,
        error: findError
    } = await supabase
        .from("saved_jobs")
        .select("id")
        .eq("candidate_id", req.user.id)
        .eq("job_id", jobId)
        .maybeSingle();

    if (findError) {
        throw new ApiError(
            400,
            findError.message
        );
    }

    if (!savedJob) {
        throw new ApiError(
            404,
            "Saved job not found"
        );
    }

    const {
        error: deleteError
    } = await supabase
        .from("saved_jobs")
        .delete()
        .eq("id", savedJob.id);

    if (deleteError) {
        throw new ApiError(
            400,
            deleteError.message
        );
    }

    return res.status(200).json(
        new ApiResponse(
            200,
            null,
            "Job removed from saved jobs"
        )
    );
});


export {
    saveJob,
    getSavedJobs,
    removeSavedJob
};