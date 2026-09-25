
import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    visitorId:{
      type:String,
      required:true,


    },
    name: {
      type: String,
      required: true,
      trim: true
    },

    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true
    },

    password: {
      type: String,
      required: true,
      minlength: 6
    },

    role: {
      type: String,
      enum: ["Agent", "Customer", "Admin"],
      default: "Customer"
    }
  },
  {
    timestamps: true
  }
);

const User = mongoose.model(
  "User",
  userSchema
);

export default User;
