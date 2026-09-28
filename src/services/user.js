import bcrypt from "bcryptjs";
import User from "../models/user.js";

export const findOrCreateCustomer = async ({ visitorId, name, email }) => {
  // Find customer
  let customer = await User.findOne({
    email: email,
    role: "customer",
  });

  // Create customer if not exists
  if (!customer) {
    const hashedPassword = await bcrypt.hash("password", 10);

    customer = await User.create({
      visitorId,
      name,
      email: email,
      password: hashedPassword,
      role: "Customer",
    });
  }

  return customer;
};

export const findOrCreateAgent = async ({
  name,
  email,
  password,
  confirmPassword,
}) => {
  try {
    const existingAgent = await User.findOne({
      email,
      role: "Agent",
    });

    if (existingAgent) {
      throw new Error("Agent already exists");
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const agent = await User.create({
      name,
      email,
      password: hashedPassword,
      role: "Agent",
    });

    return agent;
  } catch (error) {
    throw error;
  }
};
