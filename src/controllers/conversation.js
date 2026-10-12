import { getAllConversation } from "../services/conversation.js";
import { getConversationById } from "../services/conversation.js";
import { assignAgentIds } from "../services/conversation.js";

export const allConversations = async (req, res) => {
  const { userId, role } = req.user;

  const conversation = await getAllConversation({
    userId,
    role,
  });

  return res.status(200).json({
    conversation,
    sucess: true,
    message: "sucessfull",
  });
};

export const getConversation = async (req, res) => {
  const { userId, role } = req.user;
  const { conversationId } = req.params;

  console.log(userId, role, conversationId);

  const conversation = await getConversationById({
    userId,
    role,
    conversationId,
  });

  return res
    .status(200)
    .json({ conversation, sucess: true, message: "sucessfull" });
};

export const assign = async (req, res) => {
  
  
    const { conversationId, assignAgentId } = req.body;

    const sendAssignAgentId = await assignAgentIds({
      conversationId,
      assignAgentId,
    });

    return res
      .status(200)
      .json({ sendAssignAgentId , sucess: true, message: "sucessfull" });
  

  }