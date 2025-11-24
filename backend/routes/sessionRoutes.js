import express from "express";
import ChatSession from "../models/chatSession.js";
import Message from "../models/message.js";
import { authenticate } from "../middleware/auth.js";
import { sessionValidation, validate } from "../middleware/validators.js";
import logger from "../config/logger.js";

const router = express.Router();

// Create new chat session
router.post(
  "/",
  authenticate,
  sessionValidation,
  validate,
  async (req, res) => {
    try {
      const { userId } = req.body;

      if (!userId) {
        return res.status(400).json({ error: "userId is required" });
      }

      const newSession = new ChatSession({
        userId,
        title: "New Chat",
        messageIds: [],
      });

      await newSession.save();
      res.status(201).json(newSession);
    } catch (error) {
      logger.error("Error creating chat session:", error);
      res.status(500).json({ error: "Failed to create chat session" });
    }
  }
);

// Get all sessions for a user
router.get("/", authenticate, async (req, res) => {
  try {
    const { userId } = req.query;

    if (!userId) {
      return res.status(400).json({ error: "userId is required" });
    }

    const sessions = await ChatSession.find({ userId }).sort({ updatedAt: -1 });
    res.json(sessions);
  } catch (error) {
    logger.error("Error fetching chat sessions:", error);
    res.status(500).json({ error: "Failed to fetch chat sessions" });
  }
});

// Get specific session with messages
router.get("/:sessionId", authenticate, async (req, res) => {
  try {
    const { sessionId } = req.params;

    const session = await ChatSession.findById(sessionId).populate(
      "messageIds"
    );

    if (!session) {
      return res.status(404).json({ error: "Session not found" });
    }

    res.json(session);
  } catch (error) {
    logger.error("Error fetching session:", error);
    res.status(500).json({ error: "Failed to fetch session" });
  }
});

// Update session title
router.patch("/:sessionId", authenticate, async (req, res) => {
  try {
    const { sessionId } = req.params;
    const { title } = req.body;

    if (!title) {
      return res.status(400).json({ error: "title is required" });
    }

    const session = await ChatSession.findByIdAndUpdate(
      sessionId,
      { title },
      { new: true }
    );

    if (!session) {
      return res.status(404).json({ error: "Session not found" });
    }

    res.json(session);
  } catch (error) {
    logger.error("Error updating session:", error);
    res.status(500).json({ error: "Failed to update session" });
  }
});

// Delete session
router.delete("/:sessionId", authenticate, async (req, res) => {
  try {
    const { sessionId } = req.params;

    const session = await ChatSession.findByIdAndDelete(sessionId);

    if (!session) {
      return res.status(404).json({ error: "Session not found" });
    }

    // Optionally delete associated messages
    await Message.deleteMany({ _id: { $in: session.messageIds } });

    res.json({ message: "Session deleted successfully" });
  } catch (error) {
    logger.error("Error deleting session:", error);
    res.status(500).json({ error: "Failed to delete session" });
  }
});

export default router;
