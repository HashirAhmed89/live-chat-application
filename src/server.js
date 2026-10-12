import connectDB from "./config/db.js";
import { createServer } from "http";
import app from "./app.js";
import { Server } from "socket.io";

connectDB();

const httpServer = createServer(app);

const io = new Server(httpServer, {
  cors: {
    origin: "http://localhost:5173",
  },
});

io.on("connection", (socket) => {
  console.log("connected", socket.id);

  socket.onAny((event, ...args) => {
    console.log("EVENT RECEIVED:", event, args);
  });

  // This is the join handler:
  socket.on("join_conversation", (conversationId) => {
    console.log(conversationId);
    socket.join(`conversation_${conversationId}`);
  });
});

app.set("io", io);

httpServer.listen(3000, () => {
  console.log("Server running");
});
