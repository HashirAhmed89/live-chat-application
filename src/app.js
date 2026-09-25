import express from "express";
import messageRoutes from "./routes/message.js"

const app = express();

app.use(express.json());

// send message API
app.use("/api/messages",messageRoutes)

export default app;