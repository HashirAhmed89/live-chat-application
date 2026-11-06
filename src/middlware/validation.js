import { body } from "express-validator";

// Message Validation
export const messageValidation = [
  body("visitorId")
    .isString()
    .withMessage("visitorId must be a string")
    .bail()
    .trim()
    .notEmpty()
    .withMessage("visitorId is required"),

  body("name")
    .isString()
    .withMessage("Name must be a string")
    .bail()
    .trim()
    .notEmpty()
    .withMessage("Name is required")
    .isLength({ min: 2, max: 50 })
    .withMessage("Name must be between 2 and 50 characters"),

  body("email")
    .isString()
    .withMessage("Email must be a string")
    .bail()
    .trim()
    .notEmpty()
    .withMessage("Email is required")
    .isEmail()
    .withMessage("Please enter a valid email"),

  // Validate either message field and store the trimmed content.
  body().custom((_, { req }) => {
    const content = req.body.content ?? req.body.message;

    if (typeof content !== "string" || !content.trim()) {
      throw new Error("Message content is required as content or message");
    }

    if (content.trim().length > 2000) {
      throw new Error("Message cannot exceed 2000 characters");
    }

    req.body.content = content.trim();
    return true;
  }),
];

// Validate the customer details submitted by the chat widget.
export const widgetStartValidation = [
  body("name")
    .isString()
    .withMessage("Name must be a string")
    .bail()
    .trim()
    .notEmpty()
    .withMessage("Name is required")
    .isLength({ min: 2, max: 50 })
    .withMessage("Name must be between 2 and 50 characters"),

  body("email")
    .isString()
    .withMessage("Email must be a string")
    .bail()
    .trim()
    .notEmpty()
    .withMessage("Email is required")
    .isEmail()
    .withMessage("Please enter a valid email"),

  body("phone")
    .isString()
    .withMessage("Phone must be a string")
    .bail()
    .trim()
    .notEmpty()
    .withMessage("Phone is required")
    .isLength({ min: 5, max: 30 })
    .withMessage("Phone must be between 5 and 30 characters"),
];

// Login Validation
export const loginValidation = [
  body("email")
    .trim()
    .notEmpty()
    .withMessage("Email is required")
    .bail()
    .isEmail()
    .withMessage("Please enter a valid email"),

  body("password")
    .notEmpty()
    .withMessage("Password is required")
    .bail()
    .isString()
    .withMessage("Password must be a string"),
];

// Agent Validation
export const agentValidation = [
  body("visitorId")
    .trim()
    .notEmpty()
    .withMessage("Visitor ID is required")
    .isString()
    .withMessage("Visitor ID must be a string"),

  body("name")
    .trim()
    .notEmpty()
    .withMessage("Name is required")
    .isLength({ min: 3, max: 50 })
    .withMessage("Name must be 3 to 50 characters")
    .matches(/^[a-zA-Z\s]+$/)
    .withMessage("Name can only contain letters and spaces"),

  body("email")
    .trim()
    .notEmpty()
    .withMessage("Email is required")
    .isEmail()
    .withMessage("Enter a valid email"),

  body("password")
    .notEmpty()
    .withMessage("Password is required")
    .isLength({ min: 8 })
    .withMessage("Password must be at least 8 characters")
    .matches(/[A-Z]/)
    .withMessage("Password must contain an uppercase letter")
    .matches(/[0-9]/)
    .withMessage("Password must contain a number"),

  body("confirmPassword")
    .notEmpty()
    .withMessage("Confirm password is required")
    // Check that the confirmation matches the submitted password.
    .custom((confirmPassword, { req }) => {
      if (confirmPassword !== req.body.password) {
        throw new Error("Passwords do not match please check");
      }

      return true;
    }),
];
