import Ticket from "../models/ticket.js";
import User from "../models/user.js";

export const findOrCreateTicket = async ({
  customerId,
  conversationId,
  subject,
}) => {
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
  const normalizedRole = String(role || "")
    .trim()
    .toLowerCase();

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

export const getTicketById = async (id, userId, role) => {
  const normalizedRole = String(role || "")
    .trim()
    .toLowerCase();

  const ticket = await Ticket.findById(id)
    .populate("customerId", "name email")
    .populate("assignedAgentId", "name email")
    .populate("conversationId");

  if (!ticket) {
    const error = new Error("Ticket not found");
    error.statusCode = 404;
    throw error;
  }

  const allowed =
    normalizedRole === "admin" ||
    (normalizedRole === "customer" &&
      ticket.customerId?._id?.toString() === String(userId)) ||
    (normalizedRole === "agent" &&
      ticket.assignedAgentId?._id?.toString() === String(userId));

  if (!allowed) {
    const error = new Error("Access denied");
    error.statusCode = 403;
    throw error;
  }

  return ticket;
};

export const updateTicketStatus = async ({
  ticketId,
  status,
  userId,
  role,
}) => {
  const allowedStatuses = ["open", "pending", "resolved", "closed"];
  const normalizedRole = String(role || "")
    .trim()
    .toLowerCase();

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
    normalizedRole !== "admin" &&
    (normalizedRole !== "agent" ||
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

export const updateTicketPriority = async ({
  ticketId,
  priority,
  userId,
  role,
}) => {
  const normalizedRole = String(role || "")
    .trim()
    .toLowerCase();
  const fail = (message, statusCode) => {
    const error = new Error(message);
    error.statusCode = statusCode;
    return error;
  };

  const validPriorities = ["low", "medium", "high", "urgent"];

  if (!validPriorities.includes(priority)) {
    throw fail("Invalid ticket priority", 400);
  }

  const ticket = await Ticket.findById(ticketId);

  if (!ticket) {
    throw fail("Ticket not found", 404);
  }

  const isAllowed =
    normalizedRole === "admin" ||
    (normalizedRole === "agent" &&
      String(ticket.assignedAgentId) === String(userId));

  if (!isAllowed) {
    throw fail("You are not authorized to update this ticket", 403);
  }

  ticket.priority = priority;
  await ticket.save();

  return ticket;
};


export const assignTicket = async ({
  ticketId,
  agentId,
  userId,
  role,
}) => {
  const normalizedRole = String(role || "")
    .trim()
    .toLowerCase();
  const fail = (message, statusCode) => {
    const error = new Error(message);
    error.statusCode = statusCode;
    return error;
  };

  // Only admin can assign tickets
  if (normalizedRole !== "admin") {
    throw fail("Only admin can assign tickets", 403);
  }

  const assigningUser = await User.findById(userId);

  if (
    !assigningUser ||
    String(assigningUser.role || "")
      .trim()
      .toLowerCase() !== "admin"
  ) {
    throw fail("Only admin can assign tickets", 403);
  }

  // Find the ticket
  const ticket = await Ticket.findById(ticketId);

  if (!ticket) {
    throw fail("Ticket not found", 404);
  }

  // Find the agent
  const agent = await User.findById(agentId);

  if (
    !agent ||
    String(agent.role || "")
      .trim()
      .toLowerCase() !== "agent"
  ) {
    throw fail("Invalid agent", 400);
  }

  // Assign agent to ticket
  ticket.assignedAgentId = agentId;

  await ticket.save();

  return ticket;
};

export const deleteTicket = async ({ ticketId, role }) => {
  if (String(role).toLowerCase() !== "admin") {
    const error = new Error("Only admin can delete tickets");
    error.statusCode = 403;
    throw error;
  }

  const ticket = await Ticket.findById(ticketId);

  if (!ticket) {
    const error = new Error("Ticket not found");
    error.statusCode = 404;
    throw error;
  }

  await Ticket.findByIdAndDelete(ticketId);

  return ticket;
};
