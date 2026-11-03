import Conversation from "../models/conversation.js";
import Message from "../models/message.js";

// Delete a conversation and its messages after checking the user's access.
export const deleteconversation = async ({
  conversationId,
  userId,
  role,
}) => {
  // Find the conversation
  const conversation = await Conversation.findById(conversationId);

  if (!conversation) {
    const error = new Error("Conversation not found");
    error.statusCode = 404;
    throw error;
  }

  // Agent can delete only their assigned conversation
  if (
    role.toLowerCase() === "agent" &&
    String(conversation.assignedAgentId) !== String(userId)
  ) {
    const error = new Error(
      "You can delete only your assigned conversations"
    );
    error.statusCode = 403;
    throw error;
  }

  // Delete all messages of this conversation
  await Message.deleteMany({
    conversationId: conversation._id,
  });

  // Delete the conversation
  await Conversation.findByIdAndDelete(conversation._id);

  return {
    conversationId: conversation._id,
  };
};
