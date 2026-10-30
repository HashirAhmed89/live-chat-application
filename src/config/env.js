import dotenv from "dotenv";

dotenv.config();

export const PORT = process.env.PORT;
export const MONGO_URI = process.env.MONGO_URI;
export const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:5174",
];
