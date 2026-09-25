import Message from "../models/message.js";

export const messageService = async ({

  conversationId,
  senderId,
  senderType,
  content,

}) => {
  const message = await Message.create({
    conversationId,
    senderId,
    senderType,
    content,
  });

  return message;
};
