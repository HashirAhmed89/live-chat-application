import Ticket from "../models/ticket.js";

export const findOrCreateTicket = async ({ customerId, conversationId, subject }) => {
  let ticket = await Ticket.findOne({
    customerId,
    conversationId,
  });

  if (!ticket) {
    ticket = await Ticket.create({
      customerId,
      conversationId,
      subject: subject || "New Ticket",
    });
  }

  return ticket;
};

  