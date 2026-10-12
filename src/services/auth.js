import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/user.js";

export const authAttempt = async ({ email, password }) => {
  const user = await User.findOne({
    email,
    role: "Agent",
  });

  if (!user) {
    throw new Error("Invalid credentials");
  }

  const isMatched = await bcrypt.compare(password, user.password);

  if (!isMatched) {
    throw new Error("Invalid credentials");
  }

  const token = jwt.sign(
    {
      userId: user._id,
      role: user.role,
    },
    process.env.JWT_SECRET_KEY,
    {
      expiresIn: "1m",
    },
  );

  return {
    token,
    user: {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      role: user.role,
    },
  };
};
