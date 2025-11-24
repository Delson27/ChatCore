import express from "express";
import User from "../models/users.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import {
  signupValidation,
  loginValidation,
  validate,
} from "../middleware/validators.js";
import { authLimiter } from "../middleware/rateLimiter.js";
import logger from "../config/logger.js";

const router = express.Router();

//USER SIGNUP
router.post(
  "/signup",
  authLimiter,
  signupValidation,
  validate,
  async (req, res) => {
    try {
      const { username, email, password } = req.body;

      //check if email exits
      const exists = await User.findOne({ email });
      if (exists) {
        return res.status(400).json({ message: "Email already exists" });
      }
      //hash password
      const hashedPassword = await bcrypt.hash(password, 10);

      //create new User
      const newUser = new User({
        username,
        email,
        password: hashedPassword,
      });

      await newUser.save();
      logger.info(`New user created: ${email}`);
      res.json({ message: "User created successfully" });
    } catch (err) {
      logger.error("Signup error:", err);
      res.status(500).json({ error: err.message });
    }
  }
);

//USER LOGIN
router.post(
  "/login",
  authLimiter,
  loginValidation,
  validate,
  async (req, res) => {
    try {
      const { email, password } = req.body;

      //check user exists
      const user = await User.findOne({ email });
      if (!user) {
        return res.status(400).json({ error: "Invalid email" });
      }

      //check password
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(400).json({ error: "Invalid password" });
      }

      //create jwt token
      const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
        expiresIn: "7d",
      });

      // Create refresh token (longer expiry)
      const refreshToken = jwt.sign(
        { id: user._id },
        process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET,
        {
          expiresIn: "30d",
        }
      );

      logger.info(`User logged in: ${email}`);
      res.json({
        message: "Login successful",
        token,
        refreshToken,
        userId: user._id,
      });
    } catch (err) {
      logger.error("Login error:", err);
      res.status(500).json({ error: err.message });
    }
  }
);

export default router;
