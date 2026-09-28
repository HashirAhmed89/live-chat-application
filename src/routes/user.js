import { createAgent } from "../controllers/user.js";
import express from "express";

export const router = express.Router();
router.post("/", createAgent);

export default router
