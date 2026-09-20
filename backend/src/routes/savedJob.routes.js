import express from "express";

import {
    saveJob,
    getSavedJobs,
    removeSavedJob
} from "../controllers/savedJob.controller.js";

import { authenticate } from "../middleware/auth.middleware.js";
import { authorizeRoles } from "../middleware/role.middleware.js";

const router = express.Router();

router.post(
    "/",
    authenticate,
    authorizeRoles("CANDIDATE"),
    saveJob
)

router.get(
    "/",
    authenticate,
    authorizeRoles("CANDIDATE"),
    getSavedJobs
)

router.delete(
    "/:jobId",
    authenticate,
    authorizeRoles("CANDIDATE"),
    removeSavedJob
)
export { router as savedJobRoutes };