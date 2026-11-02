import {
  getTickets as fetchTickets,
  updateTicketStatus as updateTicketStatusService,
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


 export const updateTicketStatus = async (req, res) => {
  try {
    const { userId, role } = req.user;
    const { id } = req.params;
    const { status } = req.body;

    const ticket = await updateTicketStatusService({
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
