import { getAllAgents as fetchAllAgents } from "../services/agent.js";

// Allow only admins to retrieve the agent list and return a safe response.
export const getAllAgents = async (req, res) => {
  try {
    const role = String(req.user?.role || "")
      .trim()
      .toLowerCase();

    if (role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Only admins can fetch agents",
      });
    }

    const agents = await fetchAllAgents();

    return res.status(200).json({
      success: true,
      message: "Agents fetched successfully",
      data: agents,
    });
  } catch (error) {
    console.error("Failed to fetch agents:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch agents",
    });
  }
};