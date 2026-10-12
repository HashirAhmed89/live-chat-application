import express from "express";
import { login } from "../controllers/auth.js";
import { loginValidation } from "../middlware/validation.js";

const router = express.Router();

router.post(
    "/login",
    loginValidation,
    login
    
);

export default router;
