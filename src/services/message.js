import Message from "../models/message.js";
import { findOrCreateTicket } from "./ticket.js";
import { findOrCreateCustomer } from "./user.js";
import { findOrCreateConversation } from "./conversation.js";

export const send = async ({ visitorId, name, email, subject, content }) => {
  
  const customer = await findOrCreateCustomer({
    visitorId,
    name,
    email
  });

  const conversation = await findOrCreateConversation({
    customerId: customer._id,
  });

  const ticket = await findOrCreateTicket({
    customerId: customer._id,
    conversationId: conversation._id,
    subject,
  });

  const message = await createMessage({
    conversationId: conversation._id,
    senderId: customer._id,
    senderType: "customer",
    content,
  });

  return {
    customer,
    conversation,
    ticket,
    message,
  };
};

export const createMessage = async ({
  conversationId,
  senderId,
  senderType,
  content,
}) => {
  const message = await Message.create({
    conversationId,
    senderId,
    senderType,
    content,
  });

  return message;
};
