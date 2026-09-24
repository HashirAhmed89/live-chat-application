import Message from "../models/message.js";

export const createMessage = async ({name,email, conversationId, senderId, senderType, content }) => {
  const message = await Message.create({
    conversationId,
    senderId,
    senderType,
    content,
    name,
    email
  });

  return message;
};