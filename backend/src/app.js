import express from "express";
import helmet from "helmet";
import cors from "cors";

import {ApiResponse} from "./utils/ApiResponse.js";
import {errorHandler} from "./middleware/error.middleware.js";
import {authenticate} from "./middleware/auth.middleware.js";
import {authRoutes} from "./routes/auth.routes.js";
import {authorizeRoles} from "./middleware/role.middleware.js";
import {profileRoutes} from "./routes/profile.routes.js"
import { companyRoutes } from "./routes/company.routes.js";
import { jobRoutes } from "./routes/job.routes.js";
import {applicationRoutes} from "./routes/application.routes.js";
import { savedJobRoutes } from "./routes/savedJob.routes.js";

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json({limit: "10kb"}));
app.use(express.urlencoded({
     extended: true,
     limit: "10kb"
    }));


app.get("/api/health", (req, res) => {
    res.status(200).json(
        new ApiResponse(
            200,
            {
                service: "Job Portal API"
            },
            "Job Portal API is running"
        ))
})

app.get(
    "/api/protected",
    authenticate,
    (req, res) => {
        return res.status(200).json(
            new ApiResponse(
                200,
                {
                    userId: req.user.id,
                    email:req.user.email 
                },
                "Authentication successful"
            )
        )
    }
)
app.get("/api/candidate-test", 
    authenticate,
    authorizeRoles("CANDIDATE"),
    (req, res) => {
        return res.status(200).json(
            new ApiResponse(
                200,
                {
                    userId: req.user.id,
                    email: req.user.email,
                    role: req.user.profile.role
                },
                "Candidate access granted."
            )
        )
    })
app.use("/api/auth", authRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api/companies", companyRoutes)
app.use("/api/jobs", jobRoutes)
app.use("/api/applications", applicationRoutes)
app.use("/api/saved-jobs", savedJobRoutes);

app.use(errorHandler);
export {app};