import Ticket from "../models/ticket.js";

export const findOrCreateTicket = async ({ customerId, conversationId, subject }) => {
  let ticket = await Ticket.findOne({ conversationId, customerId });

  if (!ticket) {
    ticket = await Ticket.create({
      conversationId,
      customerId,
      subject: subject || "New Support Ticket",
    });
  }

  return ticket;
};

export const getTickets = async ({ userId, role }) => {
  let filter = {};
  const normalizedRole = String(role || "").trim().toLowerCase();

  if (normalizedRole === "customer") {
    filter.customerId = userId;
  } else if (normalizedRole === "agent") {
    filter.assignedAgentId = userId;
  } else if (normalizedRole !== "admin") {
    const error = new Error("Unauthorized access");
    error.statusCode = 403;
    throw error;
  }

  const tickets = await Ticket.find(filter)
    .populate("customerId", "name email")
    .populate("assignedAgentId", "name email")
    .populate("conversationId")
    .sort({ createdAt: -1 });

  return tickets;
};


  export const updateTicketStatus = async ({
    ticketId,
    status,
    userId,
    role,
  }) => {
    const allowedStatuses = ["open", "pending", "resolved", "closed"];

    if (!allowedStatuses.includes(status)) {
      const error = new Error("Invalid ticket status");
      error.statusCode = 400;
      throw error;
    }

    const ticket = await Ticket.findById(ticketId);

    if (!ticket) {
      const error = new Error("Ticket not found");
      error.statusCode = 404;
      throw error;
    }

    // Only admin and assigned agent can update status
    if (
      role !== "admin" &&
      (role !== "agent" ||
        ticket.assignedAgentId?.toString() !== userId.toString())
    ) {
      const error = new Error("You are not authorized to update this ticket");
      error.statusCode = 403;
      throw error;
    }

    ticket.status = status;

    await ticket.save();

    return ticket;
  };
