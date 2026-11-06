import bcrypt from "bcryptjs";
import User from "../models/user.js";

// Find a customer by visitor ID or email, or create one if missing.
export const findOrCreateCustomer = async ({ visitorId, name, email, phone }) => {
  const normalizedEmail = String(email).trim().toLowerCase();
  const customerRole = { $regex: /^customer$/i };
  // Match customer roles case-insensitively so older records are reused.
  let customer = await User.findOne({ visitorId, role: customerRole });

  if (!customer) {
    customer = await User.findOne({
      email: normalizedEmail,
      role: customerRole,
    });
  }

  if (!customer) {
    try {
      customer = await User.create({
        visitorId,
        name,
        email: normalizedEmail,
        phone,
        role: "Customer",
      });
      console.log(`Customer saved: ${customer._id}`);
    } catch (error) {
      if (error.code !== 11000) {
        throw error;
      }

      customer = await User.findOne({
        email: normalizedEmail,
        role: customerRole,
      });

      if (!customer) {
        throw error;
      }
    }
  } else {
    console.log(`Customer found: ${customer._id}`);
  }

  if (phone && customer.phone !== phone) {
    customer.phone = phone;
    await customer.save();
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