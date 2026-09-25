import { findOrCreateCustomer } from "../services/user.js";
import { findOrCreateConversation } from "../services/conversation.js";
import { findOrCreateTicket } from "../services/ticket.js";
import { messageService } from "../services/message.js";

export const sendMessage = async (req, res) => {
  try {
    const {
      visitorId,
      name,
      email,
      subject,
      content,
    } = req.body;

    // 1. Find or create customer
    const customer = await findOrCreateCustomer({
      visitorId,
      name,
      email,
    });

    // 2. Find or create conversation
    const conversation = await findOrCreateConversation({
      customerId: customer._id,
    });

    // 3. Find or create ticket
    const ticket = await findOrCreateTicket({
      customerId: customer._id,
      conversationId: conversation._id,
      subject,
    });

    // 4. Create message
    const message = await messageService({
      conversationId: conversation._id,
      senderId: customer._id,
      senderType: "customer",
      content,
    });

    return res.status(201).json({
      success: true,
      message: "Message sent successfully",
      data: {
        customer,
        conversation,
        ticket,
        message,
      },
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};