import express from "express";
import messageRoutes from "./routes/message.js";
import authRoutes from "./routes/auth.js";
import userRoutes from "./routes/user.js"

const app = express();

app.use(express.json());

// send message API
app.use("/api/messages", messageRoutes);

// login API
app.use("/api/auth", authRoutes);

// agent API
app.use("/api/agent",userRoutes);

export default app;