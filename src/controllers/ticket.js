import mongoose from "mongoose";
import {
  getTicketById as fetchTicketById,
  getTickets as fetchTickets,
  updateTicketStatus as fetchUpdateTicketStatus,
} from "../services/ticket.js";


export const getTickets = async (req, res) => {
  try {
    const { userId, role } = req.user;

    const tickets = await fetchTickets({
      userId,
      role,
    });

    return res.status(200).json({
      success: true,
      message: "Tickets fetched successfully",
      total: tickets.length,
      data: tickets,
    });
  } catch (error) {
    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Internal server error",
    });
  }
};

export const getTicketById = async (req, res) => {
  try {
    const { id } = req.params;
    const { userId, role } = req.user;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid ticket ID",
      });
    }

    const ticket = await fetchTicketById(id, userId, role);

    return res.status(200).json({
      success: true,
      data: ticket,
    });
  } catch (error) {
    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message,
    });
  }
};

export const updateTicketStatus = async (req, res) => {
  try {
    const { userId, role } = req.user;
    const { id } = req.params;
    const { status } = req.body;

    const ticket = await fetchUpdateTicketStatus({
      ticketId: id,
      status,
      userId,
      role,
    });

    return res.status(200).json({
      success: true,
      message: "Ticket status updated successfully",
      data: ticket,
    });
  } catch (error) {
    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Internal server error",
    });
  }
};
