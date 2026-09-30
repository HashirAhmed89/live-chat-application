import { allConversations } from "../controllers/conversation.js";
import express from "express";
import { verifyToken } from "../middlware/auth.js";

export const router = express.Router();

router.get(
    "/", 
    verifyToken , 
    allConversations
)

export default router;
