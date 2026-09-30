import { getAllConversation } from "../services/conversation.js"

export const allConversations = async (req, res) => {
    const { userId, role} = req.user

    const conversation = await getAllConversation({
        userId,
        role
    })
     
    return res.status(200).json({ 
        conversation ,
         sucess: true , 
        message : "sucessfull"
    })

}