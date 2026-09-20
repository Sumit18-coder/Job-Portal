import express from "express";

import {
    applyForJob,
    getMyApplications,
    getApplicationById,
    updateApplicationStatus,
    getRecruiterApplications
} from "../controllers/application.controller.js";

import { authenticate } from "../middleware/auth.middleware.js";
import { authorizeRoles } from "../middleware/role.middleware.js";

const router = express.Router();

router.post(
    "/",
    authenticate,
    authorizeRoles("CANDIDATE"),
    applyForJob
)

router.get(
    "/my",
    authenticate,
    authorizeRoles("CANDIDATE"),
    getMyApplications
)

router.get(
    "/recruiter",
    authenticate,
    authorizeRoles("RECRUITER"),
    getRecruiterApplications
)

router.get(
    "/:id",
    authenticate,
    getApplicationById
)

router.patch(
    "/:id/status",
    authenticate,
    authorizeRoles("RECRUITER"),
    updateApplicationStatus
)



export {router as applicationRoutes};