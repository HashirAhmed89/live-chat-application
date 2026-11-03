import express from "express";
import { validationResult } from "express-validator";
import { login } from "../controllers/auth.js";
import { loginValidation } from "../middlware/validation.js";

const router = express.Router();

// Return the first login validation error before calling the controller.
const validateLogin = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: errors.array()[0].msg,
    });
  }

  return next();
};

router.post(
    "/login",
    loginValidation,
    validateLogin,
    login
    
);

export default router;
