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

      const apiKey = process.env.GEMINI_KEY;

      // Try gemini-2.5-pro first
      let response = await fetch(
        `https://generativelanguage.googleapis.com/v1/models/gemini-2.5-pro:generateContent?key=${apiKey}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [
              {
                parts: [{ text: userMessage }],
              },
            ],
          }),
        }
      );

      let data = await response.json();

      // If Pro model is overloaded, fallback to Flash model
      if (
        data.error &&
        (data.error.code === 503 || data.error.status === "UNAVAILABLE")
      ) {
        console.log("Gemini Pro overloaded, trying Flash model...");

        response = await fetch(
          `https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              contents: [
                {
                  parts: [{ text: userMessage }],
                },
              ],
            }),
          }
        );

        data = await response.json();
      }

      // Check for API errors after retry
      if (data.error) {
        logger.error("Gemini API Error:", data.error);

        // User-friendly error messages
        if (data.error.code === 503 || data.error.status === "UNAVAILABLE") {
          return res.status(503).json({
            error:
              "The AI service is currently busy. Please try again in a few seconds.",
          });
        }

        return res.status(500).json({
          error: data.error.message || "Failed to get AI response",
        });
      }

      // Check if response has expected structure
      if (
        !data.candidates ||
        !data.candidates[0] ||
        !data.candidates[0].content ||
        !data.candidates[0].content.parts ||
        !data.candidates[0].content.parts[0]
      ) {
        return res
          .status(500)
          .json({ error: "Unexpected API response format" });
      }

      const botReply = data.candidates[0].content.parts[0].text;

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
  }
);

export default router;
