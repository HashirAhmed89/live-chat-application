import { validationResult } from "express-validator";
import { startWidgetChat } from "../services/widget.js";

// Start a chat session for a widget customer.
export const start = async (req, res) => {
  const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: "Invalid customer details",
        errors: errors.array(),
      });
    }

  try {
    const { name, email, phone } = req.body;
    const result = await startWidgetChat({
      name,
      email,
      phone,
    });

    return res.status(200).json({
      success: true,
      message: "Chat started successfully",
      ...result,
    });
  } catch (error) {
    console.error("Failed to start widget chat:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to start chat",
    });
  }
};
