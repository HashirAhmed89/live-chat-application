import express from "express";
import { getTickets , updateTicketStatus } from "../controllers/ticket.js";
import { verifyToken } from "../middlware/auth.js";

const router = express.Router()

router.get("/", verifyToken, getTickets)

router.patch("/:id", updateTicketStatus)

export default router