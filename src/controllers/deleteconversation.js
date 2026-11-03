import { deleteconversation } from "../services/deleteconversation.js";

// Check the user's role and delete the requested conversation.
export const deleteConversation = async (req, res) => {
  console.log(req)
  try {
    const { id } = req.params;
    const { userId, role } = req.user;

    // Only agents and admins can delete conversations
    if (!["agent", "admin"].includes(role?.toLowerCase())) {
      return res.status(403).json({
        success: false,
        message: "Only agents and admins can delete conversations",
      });
    }

    // Call service
    const result = await deleteconversation({
      conversationId: id,
      userId,
      role,
    });

    return res.status(200).json({
      success: true,
      message: "Conversation deleted successfully",
      ...result,
    });
  } catch (error) {
    console.error("Delete conversation error:", error);

    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Internal server error",
    });
  }
};
