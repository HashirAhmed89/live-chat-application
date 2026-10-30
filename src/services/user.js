import bcrypt from "bcryptjs";
import User from "../models/user.js";

export const findOrCreateCustomer = async ({ visitorId, name, email }) => {
  const normalizedEmail = email.trim().toLowerCase();
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
    const hashedPassword = await bcrypt.hash("password", 10);

    customer = await User.create({
      visitorId,
      name,
      email: normalizedEmail,
      password: hashedPassword,
      role: "Customer",
    });
    console.log(`Customer saved: ${customer._id}`);
  } else {
    console.log(`Customer found: ${customer._id}`);
  }

  return customer;
};

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