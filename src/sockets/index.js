import { Server } from "socket.io";
import jwt from "jsonwebtoken";
import User from "../models/user.js";
import Conversation from "../models/conversation.js";
import { allowedOrigins } from "../config/env.js";
let io;


export const initSocket = (httpServer) => {
  io = new Server(httpServer, {
    cors: {
      origin:allowedOrigins,
      methods:["GET","POST"]
    },
  });

  // Authenticate the connection
  io.use(async (socket, next) => {
    const token =
      socket.handshake.auth?.token ??
      socket.handshake.headers["x-api-key"];

    if (!token) {
      return next(new Error("API key is required"));
    }

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
    } catch {
      return next(new Error("Unauthorized"));
    }

    let user;
    try {
      user = await User.findById(decoded.userId);
    } catch (error) {
      console.error("Socket authentication user lookup failed:", error);
      return next(new Error("Authentication service unavailable"));
    }

    const role = String(user?.role || "").trim().toLowerCase();
    if (
      !user ||
      !["admin", "agent", "customer"].includes(role) ||
      String(decoded.role || "").trim().toLowerCase() !== role
    ) {
      return next(new Error("Unauthorized"));
    }

    if (role === "customer") {
      const conversationId = decoded.conversationId;
      if (!conversationId) {
        return next(new Error("Customer token is not scoped to a conversation"));
      }

      let conversation;
      try {
        conversation = await Conversation.findOne({
          _id: conversationId,
          customerId: user._id,
        }).select("_id");
      } catch (error) {
        console.error("Socket customer conversation lookup failed:", error);
        return next(new Error("Authentication service unavailable"));
      }

      if (!conversation) return next(new Error("Unauthorized"));
      socket.data.conversationId = String(conversation._id);
    }

    socket.user = user;
    return next();
  });

  // Join the appropriate room
  io.on("connection", (socket) => {
    const user = socket.user;
    const role = String(user.role || "").trim().toLowerCase();

    if (role === "admin") {
      socket.join("admins");
    } else if (role === "agent") {
      socket.join(`agent_${user._id}`);
      console.log("agent joined room !!!  ",`agent_${user._id}` )
    } else if (role === "customer") {
      socket.join(`conversation_${socket.data.conversationId}`);
    }
  });
};

export const getIO = () => io;
