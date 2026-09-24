import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
  {
    conversationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Conversation",
      required: true
    },

    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },

    senderType: {
      type: String,
      enum: ["customer", "agent", "admin"],
      required: true
    },

    content: {
      type: String,
      required: true,
      trim: true
    }
  
  },
  {
    timestamps: true
  }
);

const Message = mongoose.model(
  "Message",
  messageSchema
);

export default Message;
