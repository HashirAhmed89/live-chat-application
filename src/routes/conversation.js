import { allConversations, assign } from "../controllers/conversation.js";
import express from "express";
import { verifyToken } from "../middlware/auth.js";
import { getConversation } from "../controllers/conversation.js";
export const router = express.Router();

router.get(
    "/", 
    verifyToken , 
    allConversations
)
router.get(
    "/:conversationId",
    verifyToken ,
    getConversation

)
router.post(
    "/",
    verifyToken,
    assign

)

export default router;
