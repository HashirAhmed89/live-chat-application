import express from "express";
import { getAllAgents } from "../controllers/agent.js";
import { verifyToken } from "../middlware/auth.js";

const router = express.Router();

// Verify the caller's token before the controller enforces admin-only access.
router.get("/", verifyToken, getAllAgents);

export default router;
