import { authAttempt } from "../services/auth.js";

export const login = async (req, res) => {
  
  try {
    const { email, password } = req.body;

    const { token, user } = await authAttempt({
      email,
      password,
      
    });

    return res.status(200).json({
      success: true,
      message: "Login successfully",
      token,
      user,

    });
  } catch (error) {
    const invalidCredentials = error.message === "Invalid credentials";

    if (!invalidCredentials) {
      console.error("Login request failed:", error);
    }

    return res.status(invalidCredentials ? 401 : 503).json({
      success: false,
      message: invalidCredentials
        ? "Invalid credentials"
        : "Login service temporarily unavailable",
    });
  }
};