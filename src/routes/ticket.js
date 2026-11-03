import express from "express";
import { getTicketById ,getTickets , updateTicketStatus } from "../controllers/ticket.js";
import { verifyToken } from "../middlware/auth.js";

const router = express.Router()

router.get("/", verifyToken, getTickets)

router.get("/:id", verifyToken, getTicketById);

router.patch("/:id", verifyToken, updateTicketStatus)

export default router