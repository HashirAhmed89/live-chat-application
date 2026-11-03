import express from "express";
import messageRoutes from "./routes/message.js";
import authRoutes from "./routes/auth.js";
import userRoutes from "./routes/user.js"
import conversationRoutes from "./routes/conversation.js"
import deleteConversationRoutes from "./routes/deleteconversation.js";
import ticketRoutes, {
  assignmentRouter as ticketAssignmentRoutes,
  priorityRouter as ticketPriorityRoutes,
} from "./routes/ticket.js"

import cors from "cors"
import { allowedOrigins } from "./config/env.js"


const app = express();

app.use(cors({
  origin: allowedOrigins,
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "x-api-key"],
}));

app.use(express.json());

// send message API
app.use("/api/messages", messageRoutes);

// login API
app.use("/api/auth", authRoutes);

// user API
app.use("/api/user",userRoutes);

// get conversations

app.use("/api/conversations",conversationRoutes);

// get tickets
app.use("/api/getTickets",ticketRoutes)

// get ticket by id 
app.use("/api/getTicketById",ticketRoutes)

// update status
app.use("/api/updateTicketStatus",ticketRoutes)

app.use("/api/updateTicketPriority", ticketPriorityRoutes)

app.use("/api/assignTicket", ticketAssignmentRoutes)

// get conversation by ID 

app.use("/api/:conversation",conversationRoutes);

// assignAgentId

app.use("/api/assignAgentId",conversationRoutes)

// delete conversation
app.use("/api/deleteconversation",deleteConversationRoutes)



export default app;