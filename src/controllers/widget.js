import { validationResult } from "express-validator";
import { startWidgetChat } from "../services/widget.js";

export const start = async (req, res) => {
  try {
    // Check validation errors
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: "Invalid customer details",
        errors: errors.array(),
      });
    }

    // Get customer details
    const { visitorId, name, email, phone } = req.body;
    console.log(visitorId,name,email,phone)

    // Start chat
    const result = await startWidgetChat({
      visitorId,
      name,
      email,
      phone,
    });

    // Send response
    return res.status(200).json({
      success: true,
      message: "Chat started successfully",
      ...result,
    
    });

  } catch (error) {
    console.error("Widget Error:", error.message);

    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Something went wrong",
    });
  }
};
