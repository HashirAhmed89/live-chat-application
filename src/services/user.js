import bcrypt from "bcryptjs";
import User from "../models/user.js";

// Find a customer by visitor ID or create one if missing.
export const findOrCreateCustomer = async ({ visitorId, name, email, phone }) => {
  const normalizedEmail = String(email).trim().toLowerCase();
  const normalizedVisitorId = String(visitorId ?? "").trim();

  if (!normalizedVisitorId) {
    const error = new Error("Visitor ID is required");
    error.statusCode = 400;
    throw error;
  }

  const customerRole = { $regex: /^customer$/i };
  const customerFilter = {
    visitorId: normalizedVisitorId,
    role: customerRole,
  };
  let matches = await User.find(customerFilter)
    .select("_id visitorId name email phone role")
    .limit(2);

  if (matches.length > 1) {
    const error = new Error(
      "Multiple customer records share this visitor ID. Customer selection was stopped for investigation.",
    );
    error.statusCode = 409;
    throw error;
  }

  let customer = matches[0] ?? null;

  if (!customer) {
    try {
      customer = await User.create({
        visitorId: normalizedVisitorId,
        name,
        email: normalizedEmail,
        phone,
        role: "Customer",
      });
    } catch (error) {
      if (error.code !== 11000) {
        throw error;
      }

      matches = await User.find(customerFilter)
        .select("_id visitorId name email phone role")
        .limit(2);

      if (matches.length > 1) {
        const conflict = new Error(
          "Multiple customer records share this visitor ID. Customer selection was stopped for investigation.",
        );
        conflict.statusCode = 409;
        throw conflict;
      }

      customer = matches[0] ?? null;

      if (!customer) {
        throw error;
      }
    }
  }

  if (
    String(customer.email).trim().toLowerCase() !== normalizedEmail
  ) {
    const error = new Error(
      "This visitor ID is already associated with a different email address.",
    );
    error.statusCode = 409;
    throw error;
  }

  return customer;
};

// Create a user account after checking for a duplicate email.
export const findOrCreateUser = async ({ visitorId, name, email, password, role }) => {
  const existingUser = await User.findOne({ email });

  if (existingUser) {
    throw new Error("User with this email already exists");
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  return User.create({
    visitorId,
    name,
    email,
    password: hashedPassword,
    role,

  });
  
};