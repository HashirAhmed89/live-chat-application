import mongoose from "mongoose"

export const userSchema=new mongoose.Schema(
    Name:{
        type:String,
        required:true,
        trim:true

    },
    Email:{
        type:String,
        required:true,
        trim:true,
        unique:true,
        lowercase:true


    },
    password{
        type:String,
        required:true,
        minlength:6

    },
    role:{
        type:String,
        enum:[Agent,Customer,Admin],
        default:"Customer"

    }
)
export const User=mongoose.model(
    "user",userSchema
    
)
