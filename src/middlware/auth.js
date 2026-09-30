import jwt from "jsonwebtoken";

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

    req.user = {
      userId: decoded.userId,
      role: decoded.role,
    };

    return next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: error.message,
    });
  }
};
