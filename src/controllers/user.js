import { findOrCreateCustomer, findOrCreateUser } from "../services/user.js";


export const createCustomer = async (req, res) => {
  try {
    const { visitorId, name, email, password, role } = req.body;

    let customer = await findOrCreateCustomer({
      visitorId,
      name,
      email,
      password,
      role,
    });

    return res.status(200).json({ sucess: true, customer });
  } catch (error) {
    return res.status(500).json({
      sucess: false,
      message: error.message,
    });
  }
};


export const createUser = async (req, res) => {
  try {
    const { visitorId, name, email,role, password, confirmPassword } = req.body;

    const agent = await findOrCreateUser({
      visitorId,
      name,
      email,
      role,
      password,
      confirmPassword,
    });

    return res.status(201).json({
      success: true,
      agent,
      message: "Created",
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || "Invalid Credentials",
    });
  }
};