import express from "express";
import messageRoutes from "./routes/message.js";
import authRoutes from "./routes/auth.js";
import userRoutes from "./routes/user.js"
import conversationRoutes from "./routes/conversation.js"
import cors from "cors"


const app = express();

app.use(cors({
    origin :"http://localhost:5173",
    credentials:true

}))

app.use(express.json());

// send message API
app.use("/api/messages", messageRoutes);

// login API
app.use("/api/auth", authRoutes);

// user API
app.use("/api/user",userRoutes);

// get conversations

app.use("/api/conversations",conversationRoutes);

// get conversation by ID 

app.use("/api/:conversation",conversationRoutes);

// assignAgentId

app.use("/api/assignAgentId",conversationRoutes)

export default app;