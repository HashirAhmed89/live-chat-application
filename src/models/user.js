
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
      lowercase: true,
      unique: true,
    },

    password: {
      type: String,
      required: function () {
        return this.role === "Agent" || this.role === "Admin";
      },
      minlength: 6
    },

    phone: {
      type: String,
      trim: true,
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
