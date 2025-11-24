import express from "express";
import Message from "../models/message.js";
import { authenticate } from "../middleware/auth.js";
import logger from "../config/logger.js";

const router = express.Router();

//save message
router.post("/", authenticate, async (req, res) => {
  try {
    const { sender, text, userId } = req.body;

    const newMessage = new Message({
      sender,
      text,
      userId,
    });
    await newMessage.save();
    res.json({ success: true, message: newMessage });
  } catch (err) {
    logger.error("Error saving message:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});

//get messages for a specific user
router.get("/", authenticate, async (req, res) => {
  try {
    const { userId } = req.query;

    // Filter by userId if provided, otherwise get all (for backward compatibility)
    const filter = userId ? { userId } : {};
    const messages = await Message.find(filter).sort({ createdAt: 1 });

    res.json(messages);
  } catch (err) {
    logger.error("Error fetching messages:", err);
    res.status(500).json({ error: err.message });
  }
});
export default router;
