import { findOrCreateCustomer, findOrCreateUser } from "../services/user.js";


// Create or retrieve the customer described by the request.
export const createCustomer = async (req, res) => {
  try {
    const { visitorId, name, email  } = req.body;

    let customer = await findOrCreateCustomer({
      visitorId,
      name,
      email,
      role:"customer"
    });

    return res.status(200).json({ sucess: true, customer });
  } catch (error) {
    return res.status(500).json({
      sucess: false,
      message: error.message,
    });
  }
};


// Create a user account using the submitted details.
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