import {  createUser } from "../controllers/user.js";
import express from "express";

export const router = express.Router();
router.post("/", createUser);

export default router
