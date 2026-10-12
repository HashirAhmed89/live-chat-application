import { authAttempt } from "../services/auth.js";

export const login = async (req, res) => {
  
  try {
    const { email, password } = req.body;
    
    console.log(email,password)

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
    return res.status(401).json({
      success: false,
      message: error.message || "Invalid credentials",
    });
  }
};