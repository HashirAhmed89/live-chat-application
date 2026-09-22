import mongoose from "mongoose"

export const conversationSchema=new mongoose.Schema(
    customerId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User"
        required:true,
    },
    assignagentId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User"
    },
    status:{
        type:String,
        enum:[open,close],
        default:open

    },
    lastMsg:{
        type:date,
        default:null
    },

    {
        TimeStamp:true
    }


)

const Conversation=mongoose.model(
    "conversation",conversationSchema
)