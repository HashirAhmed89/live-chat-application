import Conversation from "../models/conversation.js"


export const findOrCreateConversation = async ({ customerId }) => {
  //  Find existing conversation

  let conversation = await Conversation.findOne({
    customerId: customerId,
  });

  // Create conversation if not exists

  if (!conversation) {
    conversation = await Conversation.create({
      customerId: customerId,
      assignedAgentId: "6abbc348309020b3efd3b66f",
    });
  }
  return conversation;
};

export const getAllConversation = async ({ userId, role }) => {
  console.log(userId, role, "user,role");

  const normalizedRole = (role || "").trim();
  const filter = normalizedRole === "Agent" ? { assignedAgentId: userId } : {};

  return await Conversation.find(filter).sort({ lastMessageAt: -1 });
};

export const getConversationById = async ({ conversationId, role, userId }) => {
  console.log(conversationId, role, userId);

  const normalizedRole = (role || "").trim();
  const filtering = { _id: conversationId };

  if (normalizedRole === "Agent") {
    filtering.assignedAgentId = userId;
  }

  return await Conversation.findOne(filtering);
};

export const assignAgentIds = async ({ conversationId, assignAgentId }) => {
  console.log(conversationId, assignAgentId);

  if (!conversationId || !assignAgentId) {
    throw new Error("Both Ids are required");
  }

  const conversation = await Conversation.findByIdAndUpdate(
    conversationId,
    { assignedAgentId: assignAgentId },
    { returnDocument: "after" } 
    
  );

  if (!conversation) {
    throw new Error("Conversation not found");
  }

  return conversation;
};
