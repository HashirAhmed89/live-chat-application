import mongoose from "mongoose";
import { getAllConversation } from "../services/conversation.js";
import { getConversationById } from "../services/conversation.js";
import { assignAgentIds } from "../services/conversation.js";

// Return conversations visible to the authenticated user.
export const allConversations = async (req, res) => {
  const { userId, role , name , email , assignedAgentId  } = req.user;

  const conversation = await getAllConversation({
    userId,
    role,
    name,
    email

  });

  return res.status(200).json({
    conversation,
    sucess: true,
    message: "sucessfull",
    
  });
};

// Return one conversation after the service checks access.
export const getConversation = async (req, res) => {
  const { userId, role } = req.user;
  const { conversationId } = req.params;

  const conversation = await getConversationById({
    userId,
    role,
    conversationId,
  });

  return res
    .status(200)
    .json({ conversation, sucess: true, message: "sucessfull" });
};

// Validate the conversation and agent IDs, then assign the agent.
export const assign = async (req, res) => {
  const { conversationId, assignAgentId } = req.body || {};

  if (
    !mongoose.isValidObjectId(conversationId) ||
    !mongoose.isValidObjectId(assignAgentId)
  ) {
    return res.status(400).json({
      success: false,
      message: "Valid conversationId and assignAgentId are required",
    });
  }

  try {
    const sendAssignAgentId = await assignAgentIds({
      conversationId,
      assignAgentId,
    });

    return res
      .status(200)
      .json({
        sendAssignAgentId,
        success: true,
        message: "Successfully assigned agent",
      });
  } catch (error) {
    if (error.message === "Conversation not found") {
      return res.status(404).json({
        success: false,
        message: error.message,
      });
    }

    throw error;
  }
};