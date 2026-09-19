import express from "express";

import {
    createCompany,
    getCompanies
} from "../controllers/company.controller.js";

import { authenticate } from "../middleware/auth.middleware.js";
import { authorizeRoles } from "../middleware/role.middleware.js";

const router = express.Router();

router.get(
    "/",
    authenticate,
    getCompanies
);

router.post(
    "/",
    authenticate,
    authorizeRoles('RECRUITER'),    
    createCompany
);

export { router as companyRoutes};
