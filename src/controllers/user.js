export const userController = async (req, res) => {
  try {
    const { visitorId, name, email, password, role } = req.body;

    let customer = await findOrCreate({
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
