  import User from "../models/user.js";

  export const findOrCreateCustomer = async ({
  visitorId,
  name,
  email,
  password,
}) => {
  // Find customer

  let customer = await User.findOne({
    email,
    role: "customer",
  });

  //  Create customer if not exists

  if (!customer) {
    customer = await User.create({
      visitorId,
      name,
      email,
      password: "password",
      role: "Customer",
    });
  }
  return customer;
};
