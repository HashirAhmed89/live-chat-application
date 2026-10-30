import express from "express";
import { messageValidation } from "../middlware/validation.js";
import {
  getMessages,
  sendAgentMessage,
  sendMessage,
} from "../controllers/message.js";
import { verifyToken } from "../middlware/auth.js";

export const router = express.Router();

router.get("/", verifyToken, getMessages);
router.post("/reply", verifyToken, sendAgentMessage);
router.post(
    "/", 
    messageValidation, 
    sendMessage
);

export default router;
