import { body } from "express-validator";

const customerValidation = [
  body("name")
    .notEmpty()
    .withMessage("Name is Required")
    .isString()
    .isLength({ min: 3, max: 10 })
    .isAlpha(),

  body("email")
    .isEmail()
    .withMessage("Valid email is required")
    .normalizeEmail(),

  body("password")
    .notEmpty()
    .withMessage("Password is required")
    .isLength({ min: 8 })
    .withMessage("Password must be at least 8 characters"),
];

export default customerValidation;