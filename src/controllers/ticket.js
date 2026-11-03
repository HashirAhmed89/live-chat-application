import mongoose from "mongoose";
import {
  getTicketById as fetchTicketById,
  getTickets as fetchTickets,
  assignTicket as fetchAssignTicket,
  updateTicketPriority as fetchUpdateTicketPriority,
  updateTicketStatus as fetchUpdateTicketStatus,
  deleteTicket as fetchDeleteTicket
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

export const updateTicketPriority = async (req, res) => {
  try {
    const { id } = req.params;
    const { priority } = req.body;
    const { userId, role } = req.user;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid ticket ID",
      });
    }

    const ticket = await fetchUpdateTicketPriority({
      ticketId: id,
      priority,
      userId,
      role,
    });

    return res.status(200).json({
      success: true,
      message: "Ticket priority updated successfully",
      data: ticket,
    });
  } catch (error) {
    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message,
    });
  }
};


export const assignTicket = async (req, res) => {
  try {
    const { id } = req.params;
    const { agentId } = req.body;
    const { userId, role } = req.user;

    if (!mongoose.isValidObjectId(id) ||
        !mongoose.isValidObjectId(agentId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid ticket ID or agent ID",
      });
    }

    const ticket = await fetchAssignTicket({
      ticketId: id,
      agentId,
      userId,
      role,
    });

    return res.status(200).json({
      success: true,
      message: "Ticket assigned successfully",
      data: ticket,
    });

  } catch (error) {
    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message,
    });
  }
};


export const deleteTicket = async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.user;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid ticket ID",
      });
    }

    const ticket = await fetchDeleteTicket({
      ticketId: id,
      role,
    });

    return res.status(200).json({
      success: true,
      message: "Ticket deleted successfully",
      data: ticket,
    });

  } catch (error) {
    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message,
    });
  }
};