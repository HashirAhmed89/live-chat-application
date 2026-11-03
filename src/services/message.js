import Message from "../models/message.js";
import Conversation from "../models/conversation.js";
import User from "../models/user.js";

import { getConversationById, findOrCreateConversation } from "./conversation.js";
import { findOrCreateTicket } from "./ticket.js";
import { findOrCreateCustomer } from "./user.js";

// 1. Customer ka message send karna
// Create or find the customer, conversation, ticket, and initial message.
export const send = async ({ visitorId, name, email, subject, content }) => {

  // Customer find karo ya new customer create karo
  const customer = await findOrCreateCustomer({
    visitorId,
    name,
    email,
  });

  // Customer ki conversation find karo ya create karo
  const conversation = await findOrCreateConversation({
    customerId: customer._id,
  });

  // Conversation ke liye ticket find karo ya create karo
  const ticket = await findOrCreateTicket({
    customerId: customer._id,
    conversationId: conversation._id,
    subject,
  });

  // Customer ka message MongoDB mein save karo
  const message = await createMessage({
    conversationId: conversation._id,
    senderId: customer._id,
    senderType: "customer",
    content,
  });

  // Conversation ka last message time update karo
  conversation.lastMessageAt = message.createdAt || new Date();
  await conversation.save();

  // Customer aur sender ki details bhi hasil karo
  await Promise.all([
    conversation.populate("customerId", "name email"),
    message.populate("senderId", "name email role"),
  ]);

  // Controller ko complete data return karo
  return {
    customer: {
      _id: customer._id,
      name: customer.name,
      email: customer.email,
      role: customer.role,
      visitorId: customer.visitorId,
    },
    conversation,
    ticket,
    message,
  };
};


// 2. Message ko database mein save karna
// Create a message record and return it to the caller.
export const createMessage = async ({
  conversationId,
  senderId,
  senderType,
  content,
}) => {

  // Message create karke MongoDB mein save karo
  const message = await Message.create({
    conversationId,
    senderId,
    senderType,
    content,
  });

  // Saved message return karo
  return message;
};


// 3. Conversation ke saare messages get karna
// Check access and return a conversation's messages in time order.
export const getConversationMessages = async ({
  conversationId,
  userId,
  role,
  customerConversationId,
}) => {

  // Role ko lowercase karo, taake comparison sahi ho
  const normalizedRole = String(role || "").trim().toLowerCase();

  let conversation;

  // Agar user customer hai
  if (normalizedRole === "customer") {

    // Check karo ke conversation ID customer ki allowed ID hai
    if (String(customerConversationId) === String(conversationId)) {

      // Check karo ke conversation isi customer ki hai
      conversation = await Conversation.findOne({
        _id: conversationId,
        customerId: userId,
      })
        .populate("customerId", "name email")
        .lean();

    } else {
      conversation = null;
    }

  } else {

    // Agent/admin ke liye permission check karke conversation get karo
    conversation = await getConversationById({
      conversationId,
      userId,
      role,
    });
  }

  // Agar conversation nahi mili, to aage process mat karo
  if (!conversation) return null;

  // Is conversation ke saare messages get karo
  const messages = await Message.find({ conversationId })
    .populate("senderId", "name email role")
    .sort({ createdAt: 1, _id: 1 }) // Purana message pehle
    .lean();

  // Conversation aur messages return karo
  return {
    conversation,
    messages,
  };
};


// 4. Agent, admin ya customer ka reply send karna
// Verify the sender's access, save their reply, and return the updated data.
export const sendAgentReply = async ({
  conversationId,
  userId,
  role,
  customerConversationId,
  content,
}) => {

  // Role ko lowercase karo
  const normalizedRole = String(role || "").trim().toLowerCase();

  // Sirf in roles ko message send karne ki permission hai
  if (!["agent", "admin", "customer"].includes(normalizedRole)) {
    return null;
  }

  // Database se sender ki details get karo
  const sender = await User.findById(userId).select(
    "_id name email role"
  );

  // Check karo ke user exist karta hai aur role match karta hai
  if (
    !sender ||
    String(sender.role).trim().toLowerCase() !== normalizedRole
  ) {
    return null;
  }

  // Check karo ke sender ko is conversation ki access hai
  const conversation = await getConversationById({
    conversationId,
    userId: sender._id,
    role: sender.role,
    customerConversationId,
  });

  // Access nahi hai ya conversation nahi mili
  if (!conversation) return null;

  // Sender ka message database mein save karo
  const message = await Message.create({
    conversationId: conversation._id,
    senderId: sender._id,
    senderType: normalizedRole,
    content,
  });

  // Conversation ka last message time update karo
  await Conversation.updateOne(
    { _id: conversation._id },
    { $set: { lastMessageAt: message.createdAt } }
  );

  // Message ke saath sender ka name, email aur role bhi lao
  await message.populate("senderId", "name email role");

  // Updated conversation aur message return karo
  return {
    conversation: {
      ...conversation,
      lastMessageAt: message.createdAt,
    },
    message,
  };
};