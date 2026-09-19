import express from 'express';
import {register, login, createRecruiter} from '../controllers/auth.controller.js';

const router = express.Router();
router.post('/register', register);
router.post('/login', login);
router.post("/create-recruiter", createRecruiter);

export {router as authRoutes};