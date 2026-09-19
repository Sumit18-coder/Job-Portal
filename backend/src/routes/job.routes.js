import express from "express";

import {
    createJob,
    getJobs,
    getJobById
} from "../controllers/job.controller.js";

import { authenticate } from "../middleware/auth.middleware.js";
import { authorizeRoles } from "../middleware/role.middleware.js";

const router = express.Router();

router.get(
    "/",
    authenticate,
    getJobs
);

router.get(
    "/:id",
    authenticate,
    getJobById
);

router.post(
    "/",
    authenticate,
    authorizeRoles("RECRUITER"),
    createJob
)

export { router as jobRoutes };