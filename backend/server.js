import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import aiRoutes from "./routes/aiRoutes.js";
import mongoose from "mongoose";
import messageRoutes from "./routes/messageRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import sessionRoutes from "./routes/sessionRoutes.js";
import { apiLimiter } from "./middleware/rateLimiter.js";
import logger from "./config/logger.js";

dotenv.config();

const app = express();

// CORS configuration - allow multiple origins (development + production)
const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (mobile apps, curl, etc.)
    if (!origin) return callback(null, true);

    // Allow localhost for development
    if (origin.includes("localhost")) {
      return callback(null, true);
    }

    // Allow any Vercel deployment
    if (origin.endsWith(".vercel.app")) {
      return callback(null, true);
    }

    // Allow specific frontend URL from environment variable
    if (process.env.FRONTEND_URL && origin === process.env.FRONTEND_URL) {
      return callback(null, true);
    }

    // Reject other origins
    callback(new Error("Not allowed by CORS"));
  },
  credentials: true,
  optionsSuccessStatus: 200,
};

app.use(cors(corsOptions));
app.use(express.json());

// Apply rate limiting to all API routes
app.use("/api", apiLimiter);

app.use("/api", aiRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/users", userRoutes);
app.use("/api/sessions", sessionRoutes);

app.get("/", (req, res) => {
  res.send("Backend is running");
});

//connecting to mongo db
async function connectDB() {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      dbName: "ai_chatbot",
    });
    logger.info("Connected to MongoDB");
  } catch (err) {
    logger.error("Error connecting to MongoDB:", err);
    process.exit(1);
  }
}
connectDB();

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  logger.info(`Server is running on port ${PORT}`);
});
