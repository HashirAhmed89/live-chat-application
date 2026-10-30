import http from "http";
import app from "./app.js";
import { initSocket } from "./sockets/index.js";
import connectDB from "./config/db.js";

const server = http.createServer(app);

initSocket(server);

const startServer = async () => {
  try {
    await connectDB();

    const PORT = process.env.PORT || 3000;

    server.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Server startup failed:", error.message);
    process.exit(1);
  }
};

startServer();
