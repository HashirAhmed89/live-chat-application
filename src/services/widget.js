import { randomUUID } from "node:crypto";
import jwt from "jsonwebtoken";
import { findOrCreateConversation } from "./conversation.js";
import { findOrCreateCustomer } from "./user.js";

// Find or create the customer and conversation for a widget session.
export const startWidgetChat = async ({ name, email, phone }) => {
  if (!process.env.JWT_SECRET_KEY) {
    throw new Error("Widget sessions are not configured");
  }

  // Create a visitor ID for this widget request.
  const visitorId = randomUUID();

  // Check if the customer already exists.
  const customer = await findOrCreateCustomer({
    visitorId,
    name,
    email,
    phone,
  });

  // Find or create the customer's conversation.
  const conversation = await findOrCreateConversation({
    customerId: customer._id,
  });

  // Create a secure session token for later customer requests.
  const customerSocketToken = jwt.sign(
    {
      userId: String(customer._id),
      role: "Customer",
      conversationId: String(conversation._id),
    },
    process.env.JWT_SECRET_KEY,
    { expiresIn: "10d" }
  );

  return {
    customer: {
      _id: customer._id,
      name: customer.name,
      email: customer.email,
      phone: customer.phone,
    },
    conversation: {
      _id: conversation._id,
      status: conversation.status,
    },
    customerSocketToken,
  };
};