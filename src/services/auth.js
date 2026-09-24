// import User from "../models/user.js";

// const register = async ({ name, email, password }) => {
//   try {
//     const existingUser = await User.findOne({ email })
//     if (existingUser) {
//       throw new error("user already exits");
//     }
//     const hashedPassword = await bcrypt.hash(password, 10)
//     const user = await User.create({
//       name,
//       email,
//       password: hashedPassword
//     })
//     return user;

//     const login = async ({ email, password }) => {
//       const user = await User.findOne({ email })
//       if (!user) {
//         throw new Error("invalid email or password")
//       }
//       const isMatched=await bcrypt.compare(password,user.password)
//       if(!isMatched){
//         throw new Error("Invalid email or password")
//       }
//       const token=jwt.sign(
//         {
//             user_Id:user_id,
//             email:user.email
//         },
//         JWT_SECRET,{
//             expiresIn:"1d"
//         }
//       )
//       return {
//         token,
//         user
//       }

//     }
//   } catch (error) {
//     console.log(error, "error");
//   }
// };
