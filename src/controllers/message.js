import User from "../models/User.js";
import Conversation from "../models/conversation.js";
import Ticket from "../models/ticket.js";
import { createMessage } from "../services/message.js";

export const sendMessage = async (req, res) => {
  try {
    const {
      visitorId,
      name,
      email,
      subject,
      content,
    } = req.body;

    // 1. Find customer
    let customer = await User.findOne({
      email,
      role: "customer",
    });

    // 2. Create customer if not exists
    if (!customer) {
      customer = await User.create({
        visitorId,
        name,
        email,
        password:"password",
        role: "Customer",
      });
    }

    // 3. Find existing conversation
    let conversation = await Conversation.findOne({
      customerId: customer._id,
    });

    // 4. Create conversation if not exists
    if (!conversation) {
      conversation = await Conversation.create({
        customerId: customer._id,
      });
    }

    // 5. Find ticket for this conversation
    let ticket = await Ticket.findOne({
      conversationId: conversation._id,
    });

    // 6. Create ticket if not exists
    if (!ticket) {
      ticket = await Ticket.create({
        customerId: customer._id,
        conversationId: conversation._id,
        subject: subject || "New Ticket",
      });
    }

    // 7. Create message
    const newMessage = await createMessage({
      senderId: customer._id,
      senderType: "customer",
      conversationId: conversation._id,
      content,
    });

    // 8. Send one response
    return res.status(201).json({
      success: true,
      message: "Message sent successfully",
      customer,
      conversation,
      ticket,
      newMessage,
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


