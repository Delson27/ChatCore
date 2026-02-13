import express from "express";
import dotenv from "dotenv";
import Message from "../models/message.js";
import ChatSession from "../models/chatSession.js";
import { authenticate } from "../middleware/auth.js";
import { messageValidation, validate } from "../middleware/validators.js";
import { aiLimiter } from "../middleware/rateLimiter.js";
import logger from "../config/logger.js";

dotenv.config();
const router = express.Router();

router.post(
  "/generate",
  authenticate,
  aiLimiter,
  messageValidation,
  validate,
  async (req, res) => {
    try {
      const { userMessage, sessionId } = req.body;

      const apiKey = process.env.GROQ_API_KEY;

      if (!apiKey) {
        return res.status(500).json({
          error: "API key not configured. Please add GROQ_API_KEY to .env",
        });
      }

      // Call Groq API (fast and free - 30 RPM)
      const response = await fetch(
        "https://api.groq.com/openai/v1/chat/completions",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${apiKey}`,
          },
          body: JSON.stringify({
            model: "llama-3.3-70b-versatile", // Best balance: fast, capable, recent
            messages: [
              {
                role: "user",
                content: userMessage,
              },
            ],
            temperature: 0.7,
            max_tokens: 1024,
          }),
        },
      );

      const data = await response.json();

      // Check for API errors
      if (data.error) {
        logger.error("Groq API Error:", data.error);

        // User-friendly error messages
        if (response.status === 503) {
          return res.status(503).json({
            error:
              "The AI service is currently busy. Please try again in a few seconds.",
          });
        }

        if (response.status === 429) {
          return res.status(429).json({
            error: "Rate limit exceeded. Please try again in a moment.",
          });
        }

        return res.status(500).json({
          error: data.error.message || "Failed to get AI response",
        });
      }

      // Check if response has expected structure
      if (
        !data.choices ||
        !data.choices[0] ||
        !data.choices[0].message ||
        !data.choices[0].message.content
      ) {
        logger.error("Unexpected API response format:", data);
        return res
          .status(500)
          .json({ error: "Unexpected API response format" });
      }

      const botReply = data.choices[0].message.content;

      // Save user message to MongoDB
      const userMsg = new Message({
        sender: "user",
        text: userMessage,
        userId: req.body.userId || "guest", // Optional: track user
      });
      await userMsg.save();

      // Save bot reply to MongoDB
      const botMsg = new Message({
        sender: "bot",
        text: botReply,
        userId: req.body.userId || "guest",
      });
      await botMsg.save();

      // Add message IDs to session
      await ChatSession.findByIdAndUpdate(sessionId, {
        $push: { messageIds: { $each: [userMsg._id, botMsg._id] } },
        $set: { updatedAt: new Date() },
      });

      res.json({ reply: botReply });
    } catch (error) {
      logger.error("AI generation error:", error);
      res.status(500).json({ error: "Server error" });
    }
  },
);

export default router;
