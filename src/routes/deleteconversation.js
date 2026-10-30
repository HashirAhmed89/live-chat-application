import express from "express";
import { deleteConversation } from "../controllers/deleteconversation.js";
import { verifyToken } from "../middlware/auth.js";

export const router = express.Router();

router.delete("/:id", verifyToken, deleteConversation);

export default router;
