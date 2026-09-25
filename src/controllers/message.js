import { send } from "../services/message.js";

export const sendMessage = async (req, res) => {
  try {
    const {
      visitorId,
      name,
      email,
      subject,
      content
    } = req.body;

    const result = await send({
      visitorId,
      name,
      email,
      subject,
      content
    });

    return res.status(201).json({
      success: true,
      message: "Message sent successfully",
      data: result
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};