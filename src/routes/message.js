import express from "express";
import { messageValidation } from "../middlware/validation.js";
import { sendMessage } from "../controllers/message.js";

export const router = express.Router();

router.post(
    "/", 
    messageValidation, 
    sendMessage
);

export default router;
