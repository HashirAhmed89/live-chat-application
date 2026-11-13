import jwt from "jsonwebtoken";
import { findOrCreateConversation } from "./conversation.js";
import { findOrCreateCustomer } from "./user.js";

export const startWidgetChat = async ({ visitorId, name, email, phone }) => {
  if (!process.env.JWT_SECRET_KEY) {
    throw new Error("Widget sessions are not configured");
  }

  const customer = await findOrCreateCustomer({
    visitorId,
    name,
    email,
    phone,
  });

  const conversation = await findOrCreateConversation({
    customerId: customer._id,
  });

  const token = jwt.sign(
    {
      userId: String(customer._id),
      role: "Customer",
      conversationId: String(conversation._id),
    },
    process.env.JWT_SECRET_KEY,
    { expiresIn: "10d" },
  );

 return {
  customer: {
    _id: customer._id,
    visitorId: customer.visitorId,
    name: customer.name,
    email: customer.email,
    phone: customer.phone,
  },
  conversation,
  token,
};
};
