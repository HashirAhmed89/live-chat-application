import User from "../models/user.js";

// Fetch agent accounts while selecting only the fields needed by the caller.
export const getAllAgents = async () => {
  // Match agent roles regardless of capitalization in existing user records.
  // Project only public fields so passwords and other user data are excluded.
  return User.find({ role: { $regex: /^agent$/i } }).select("_id name email");
};