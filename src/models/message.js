import mongoose from "mongoose"

export const message = new moongose.model(
    conversationId:{moongose.Schema.Types.ObjectId,
    ref:"conversation",
    required:true
    },
    senderId:{
        moongose.Schema.Types.ObjectId,
        ref:"user",
        required:true

    },
    senderType:{
        type:"String",
        enum:["customer","agent","admin"],

    },
    content:{
        type:"String",
        required:true,
        trim:true
    },{
        TimeStamp:true
    }
)
export const message=moongose.model(
    "message",message
    )