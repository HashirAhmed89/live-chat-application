import jwt from "jsonwebtoken";

// Verify the x-api-key JWT and attach its user claims to the request.
export const verifyToken = (req, res, next) => {
  try {
    const token = req.headers["x-api-key"];

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Token required",
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);

    if (
      typeof decoded !== "object" ||
      decoded === null ||
      typeof decoded.userId !== "string" ||
      !decoded.userId ||
      typeof decoded.role !== "string" ||
      !decoded.role
    ) {
      return res.status(401).json({
        success: false,
        message: "Invalid token payload",
      });
    }

    req.user = {
      userId: decoded.userId,
      role: decoded.role,
      conversationId: decoded.conversationId,
    };

    return next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Invalid or expired token",
    });
  }
};
