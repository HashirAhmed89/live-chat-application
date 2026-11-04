import express from "express";
import {
  getTicketById,
  getTickets,
  updateTicketStatus,
  updateTicketPriority,
  assignTicket,
  deleteTicket
} from "../controllers/ticket.js";
import { verifyToken } from "../middlware/auth.js";

const router = express.Router();
export const priorityRouter = express.Router();
export const assignmentRouter = express.Router();

router.get("/", verifyToken, getTickets);

router.get("/:id", verifyToken, getTicketById);

router.patch("/:id", verifyToken, updateTicketStatus);

priorityRouter.patch("/:id", verifyToken, updateTicketPriority);

assignmentRouter.post("/:id", verifyToken ,assignTicket);

router.delete("/:id", verifyToken, deleteTicket);

export default router;
