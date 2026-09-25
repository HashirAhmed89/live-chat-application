import Conversation from "../models/conversation.js";

export const findOrCreateConversation = async ({ customerId }) => {
  //  Find existing conversation

  let conversation = await Conversation.findOne({
    customerId: customerId,
  });

  // Create conversation if not exists

  if (!conversation) {
    conversation = await Conversation.create({
      customerId: customerId,
    });
  }
  return conversation;
};
