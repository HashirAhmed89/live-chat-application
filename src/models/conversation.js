import mongoose from "mongoose";

const conversationSchema = new mongoose.Schema(
  {
    customerId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref:"User"
    },

    assignedAgentId: {
      type: mongoose.Schema.Types.ObjectId,
      default: null,
      ref:"User"
    },

    status: {
      type: String,
      enum: ["open", "close"],
      default: "open"
    },

    lastMessageAt: {
      type: Date,
      default: null
    }
  },
  {
    timestamps: true
  }
)


const Conversation = mongoose.model(
  "Conversation",
  conversationSchema
);

export default Conversation;