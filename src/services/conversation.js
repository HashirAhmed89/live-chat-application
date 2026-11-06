
import Conversation from "../models/conversation.js";
import Message from "../models/message.js";
import { getIO } from "../sockets/index.js";

// 1. Find an existing conversation or create a new one
// Return the customer's existing conversation or create one.
export const findOrCreateConversation = async ({
  customerId,
  assignAgentId,
  
}) => {
  // Check if this customer already has a conversation
  let conversation = await Conversation.findOne({
    customerId: customerId,
  });

  // If conversation does not exist, create a new one
  if (!conversation) {
    try {
      conversation = await Conversation.create({
        customerId: customerId,
        assignedAgentId: assignAgentId,
      });
    } catch (error) {
      if (error.code !== 11000) {
        throw error;
      }

      conversation = await Conversation.findOne({ customerId });

      if (!conversation) {
        throw error;
      }
    }

    console.log(`Conversation saved: ${conversation._id}`);
  } else {
    // If conversation already exists, use the existing one
    console.log(`Conversation found: ${conversation._id}`);
  }

  // Return the conversation to the controller
  return conversation;
};


// 2. Get all conversations for the logged-in user
// List conversations visible to the user's role with their latest messages.
export const getAllConversation = async ({ userId, role }) => {

  // Convert role to lowercase to avoid uppercase/lowercase issues
  const normalizedRole = String(role || "")
    .trim()
    .toLowerCase();

  // Admin can see all conversations
  // Agent can see only assigned conversations
  // Other roles cannot see conversations through this function
  let filter;

  if (normalizedRole === "agent") {
    filter = { assignedAgentId: userId };
  } else if (normalizedRole === "admin") {
    filter = {};
  } else {
    filter = { _id: null };
  }

  // Get conversations and customer information
  const conversations = await Conversation.find(filter)
    .populate("customerId", "name email phone")
    .lean();

  // If there are no conversations, return an empty array
  if (conversations.length === 0) {
    return conversations;
  }

  // Get all conversation IDs
  const conversationIds = conversations.map(
    // Collect each conversation's database ID for message lookup.
    (conversation) => conversation._id
  );

  // Find the latest message ID for each conversation
  const latestMessageRows = await Message.aggregate([
    {
      // Get messages belonging to these conversations
      $match: {
        conversationId: { $in: conversationIds },
      },
    },
    {
      // Sort messages from newest to oldest
      $sort: {
        createdAt: -1,
        _id: -1,
      },
    },
    {
      // Keep only the latest message ID for each conversation
      $group: {
        _id: "$conversationId",
        messageId: { $first: "$_id" },
      },
    },
  ]);

  // Get the latest messages using their IDs
  // Also get the sender's name, email and role
  const latestMessages = await Message.find({
    _id: {
      // Collect the latest message IDs for the database query.
      $in: latestMessageRows.map((row) => row.messageId),
    },
  })
    .populate("senderId", "name email role")
    .lean();

  // Create a map to find a message using its conversation ID
  const latestMessageByConversationId = new Map(
    // Index each message by its conversation ID.
    latestMessages.map((message) => [
      String(message.conversationId),
      message,
    ])
  );

  // Add the latest message and its time to each conversation
  const conversationsWithLastMessage = conversations.map(
    // Attach the latest message and activity time to one conversation.
    (conversation) => {

      // Find the latest message for this conversation
      const lastMessage =
        latestMessageByConversationId.get(
          String(conversation._id)
        ) ?? null;

      return {
        ...conversation,

        // Attach the latest message
        lastMessage,

        // Use the latest message time if available
        // Otherwise, use the conversation's saved time
        lastMessageAt:
          lastMessage?.createdAt ??
          conversation.lastMessageAt ??
          null,
      };
    }
  );

  // Show the most recently active conversations first
  // Compare activity times to sort conversations from newest to oldest.
  conversationsWithLastMessage.sort((a, b) => {
    const timeA = new Date(
      a.lastMessageAt || a.createdAt
    ).getTime();

    const timeB = new Date(
      b.lastMessageAt || b.createdAt
    ).getTime();

    return timeB - timeA;
  });

  // Return the final conversation list
  return conversationsWithLastMessage;
};


// 3. Get one conversation using its ID
// Return a conversation only when the user is allowed to access it.
export const getConversationById = async ({
  conversationId,
  role,
  userId,
  customerConversationId,
}) => {

  // Normalize the user's role
  const normalizedRole = String(role || "")
    .trim()
    .toLowerCase();

  // Start by searching for the requested conversation
  const filter = {
    _id: conversationId,
  };

  // Agent can access only conversations assigned to them
  if (normalizedRole === "agent") {
    filter.assignedAgentId = userId;
  }

  // Customer can access only their own conversation
  else if (normalizedRole === "customer") {

    // Check whether the requested conversation ID
    // matches the customer's allowed conversation ID
    if (
      !customerConversationId ||
      String(customerConversationId) !== String(conversationId)
    ) {
      return null;
    }

    // Make sure the conversation belongs to this customer
    filter.customerId = userId;
  }

  // Admin can access any conversation
  else if (normalizedRole !== "admin") {
    return null;
  }

  // Find the conversation and include customer and agent details
  return Conversation.findOne(filter)
    .populate("customerId", "name email phone")
    .populate("assignedAgentId", "name email role")
    .lean();
};


// 4. Assign a conversation to an agent
// Save the agent assignment and notify both agents through Socket.IO.
export const assignAgentIds = async ({
  conversationId,
  assignAgentId,
}) => {

  // Both IDs are required
  if (!conversationId || !assignAgentId) {
    throw new Error("Both IDs are required");
  }

  // Find the conversation in MongoDB
  const conversation = await Conversation.findById(
    conversationId
  );

  // Stop if the conversation does not exist
  if (!conversation) {
    throw new Error("Conversation not found");
  }

  // Save the previous agent's ID
  const oldAgent = conversation.assignedAgentId;

  // Assign the conversation to the new agent
  conversation.assignedAgentId = assignAgentId;

  // Save the updated conversation in MongoDB
  await conversation.save();

  // Get the Socket.IO server instance
  const io = getIO();

  // Remove the conversation from the previous agent's list
  if (oldAgent) {
    io.to(`agent_${oldAgent}`).emit(
      "conversation_removed",
      conversation._id
    );
  }

  // Get the updated conversation with customer details
  const populatedConversation = await Conversation.findById(
    conversation._id
  )
    .populate("customerId", "name email")
    .lean();

  // Send the conversation to the newly assigned agent in real time
  io.to(`agent_${assignAgentId}`).emit(
    "conversation_assigned",
    populatedConversation
  );

  // Return the updated conversation
  return conversation;
};
