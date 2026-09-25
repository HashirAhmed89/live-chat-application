import express from "express";
import { sendMessage } from "../controllers/message.js";
import { messageValidation } from "../middlware/validation.js";

export const router = express.Router();
router.post(
    "/", 
    messageValidation, 
    sendMessage
);

export default router;
