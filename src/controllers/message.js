import {
  getConversationMessages,
  send,
  sendAgentReply,
} from "../services/message.js";

import { getIO } from "../sockets/index.js";
import { validationResult } from "express-validator";
import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import User from "../models/user.js";
import Conversation from "../models/conversation.js";


// 1. Customer ka message receive aur send karna
// Validate a customer's request, save the message, and notify connected users.
export const sendMessage = async (req, res) => {
  try {
    // Check karo ke request mein koi validation error to nahi
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: "Invalid message request",
        errors: errors.array(),
      });
    }

    // Request se customer aur message ki details lo
    const { visitorId, name, email, subject } = req.body;

    // Email ko clean karo
    const normalizedEmail = String(email || "")
      .trim()
      .toLowerCase();

    // Check karo ke customer pehle se database mein hai ya nahi
    const existingCustomer = await User.findOne({
      role: { $regex: /^customer$/i },
      $or: [{ visitorId }, { email: normalizedEmail }],
    });

    let verifiedCustomerToken = null;

    // Agar customer pehle se exist karta hai
    if (existingCustomer) {

      // Existing customer ke liye session token zaroori hai
      if (!req.body.customerSocketToken) {
        return res.status(401).json({
          success: false,
          message: "A valid customer session is required to continue this chat",
        });
      }

      // Token verify karo
      try {
        verifiedCustomerToken = jwt.verify(
          req.body.customerSocketToken,
          process.env.JWT_SECRET_KEY
        );
      } catch {
        return res.status(401).json({
          success: false,
          message: "Customer session is invalid or expired",
        });
      }

      // Check karo ke token isi customer ka hai
      if (
        String(verifiedCustomerToken.userId) !==
          String(existingCustomer._id) ||
        String(verifiedCustomerToken.role).toLowerCase() !== "customer" ||
        !verifiedCustomerToken.conversationId
      ) {
        return res.status(403).json({
          success: false,
          message: "Customer session does not match this account",
        });
      }

      // Check karo ke token wali conversation isi customer ki hai
      const customerConversation = await Conversation.findOne({
        _id: verifiedCustomerToken.conversationId,
        customerId: existingCustomer._id,
      }).select("_id");

      if (!customerConversation) {
        return res.status(403).json({
          success: false,
          message: "Customer session does not match this conversation",
        });
      }

    } else if (req.body.customerSocketToken) {

      // New customer ke saath kisi aur ka token accept mat karo
      return res.status(403).json({
        success: false,
        message: "Customer session does not match this account",
      });
    }

    // Customer, conversation, ticket aur message handle karo
    const result = await send({
      visitorId,
      name,
      email,
      subject,
      content: req.body.content ?? req.body.message,
    });

    const { conversation, message, customer } = result;

    // Existing customer ka token use karo
    // New customer ke liye token create karo
    const customerSocketToken = verifiedCustomerToken
      ? req.body.customerSocketToken
      : jwt.sign(
          {
            userId: customer._id,
            role: customer.role,
            conversationId: conversation._id,
          },
          process.env.JWT_SECRET_KEY,
          { expiresIn: "10d" }
        );

    // Verify karo ke token ki conversation returned conversation se match karti hai
    if (
      verifiedCustomerToken &&
      String(verifiedCustomerToken.conversationId) !==
        String(conversation._id)
    ) {
      return res.status(403).json({
        success: false,
        message: "Customer session does not match this conversation",
      });
    }

    // Socket.IO server hasil karo
    const io = getIO();

    // Assigned agent ki ID nikalo
    const assignedAgentId =
      conversation.assignedAgentId?._id ??
      conversation.assignedAgentId;

    // Admins aur conversation room ko message bhejne ke liye select karo
    let recipients = io
      .to(`conversation_${conversation._id}`)
      .to("admins");

    // Agar agent assigned hai, to usko bhi message bhejo
    if (assignedAgentId) {
      recipients = recipients.to(`agent_${assignedAgentId}`);
    }

    // Message real-time mein emit karo
    recipients.emit("new_message", {
      conversation,
      message,
      customer,
    });

    // Client ko success response aur customer token return karo
    return res.status(201).json({
      success: true,
      message: "Message sent successfully",
      data: result,
      customerSocketToken,
    });

  } catch (error) {
    console.error("Failed to send message:", error);

    // Invalid database data
    if (
      error.name === "ValidationError" ||
      error.name === "CastError"
    ) {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }

    // Duplicate record error
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "A record with these details already exists",
      });
    }

    // Other server errors
    return res.status(500).json({
      success: false,
      message: "Failed to save the customer, conversation, or message",
    });
  }
};


// 2. Conversation ke messages get karna
// Return messages for a conversation the authenticated user may access.
export const getMessages = async (req, res) => {

  // URL query se conversation ID lo
  const { conversationId } = req.query;

  // Check karo ke ID valid hai
  if (!mongoose.isValidObjectId(conversationId)) {
    return res.status(400).json({
      success: false,
      message: "A valid conversationId query parameter is required",
    });
  }

  // Service se permission check karke messages get karo
  const result = await getConversationMessages({
    conversationId,
    userId: req.user.userId,
    role: req.user.role,
    customerConversationId: req.user.conversationId,
  });

  // Conversation nahi mili ya access allowed nahi
  if (!result) {
    return res.status(404).json({
      success: false,
      message: "Conversation not found",
    });
  }

  // Conversation aur messages return karo
  return res.status(200).json({
    success: true,
    conversation: result.conversation,
    messages: result.messages,
  });
};


// 3. Agent, admin ya customer ka reply send karna
// Validate and send a reply from an authenticated conversation participant.
export const sendAgentMessage = async (req, res) => {

  // User ka role lowercase mein lo
  const role = String(req.user.role || "")
    .trim()
    .toLowerCase();

  // Sirf allowed roles message send kar sakte hain
  if (!["agent", "admin", "customer"].includes(role)) {
    return res.status(403).json({
      success: false,
      message: "This account cannot send conversation messages",
    });
  }

  // Request se conversation ID aur message lo
  const { conversationId, content } = req.body || {};

  // Conversation ID validate karo
  if (!mongoose.isValidObjectId(conversationId)) {
    return res.status(400).json({
      success: false,
      message: "A valid conversationId is required",
    });
  }

  // Message empty nahi hona chahiye aur 2000 characters se zyada nahi
  if (
    typeof content !== "string" ||
    !content.trim() ||
    content.trim().length > 2000
  ) {
    return res.status(400).json({
      success: false,
      message: "Message content must contain 1 to 2000 characters",
    });
  }

  try {
    // Service message save karegi aur access check karegi
    const result = await sendAgentReply({
      conversationId,
      userId: req.user.userId,
      role,
      customerConversationId: req.user.conversationId,
      content: content.trim(),
    });

    // Conversation nahi mili ya access denied hai
    if (!result) {
      return res.status(404).json({
        success: false,
        message: "Conversation not found or access denied",
      });
    }

    // Assigned agent ki ID nikalo
    const assignedAgentId =
      result.conversation.assignedAgentId?._id ??
      result.conversation.assignedAgentId;

    // Admins aur conversation room ko target karo
    let recipients = getIO()
      .to(`conversation_${result.conversation._id}`)
      .to("admins");

    // Assigned agent ko bhi target karo
    if (assignedAgentId) {
      recipients = recipients.to(`agent_${assignedAgentId}`);
    }

    // Naya message real-time mein emit karo
    recipients.emit("new_message", {
      conversation: result.conversation,
      message: result.message,
    });

    // Success response return karo
    return res.status(201).json({
      success: true,
      message: "Reply sent successfully",
      data: result,
    });

  } catch (error) {
    console.error("Failed to send agent reply:", error);

    // Agar error aaye to server response
    return res.status(500).json({
      success: false,
      message: "Failed to save the reply",
    });
  }
};