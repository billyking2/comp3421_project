import { Router, Request, Response } from "express";
import bcrypt from "bcryptjs";
import pool from "../config/db";
import jwt from "jsonwebtoken";
import {requireAuth} from "../controllers/requireAuth"

const router = Router();


router.get(
  "/me",
  requireAuth,
  (req: any, res) => {
     res.status(200).json({
      userId: req.user.userId,
      username: req.user.username,
      role: req.user.role,
    });
  }
);

// Login Route
router.post("/signIn", async (req: Request, res: Response): Promise<void> => {
  try {
    const { username, password } = req.body;

    // 1. Validate input
    if (!username || !password) {
      res
        .status(400)
        .json({ error: "Please provide both username and password" });
      return;
    }

    // 2. Find user in PostgreSQL by username (or email)
    const userResult = await pool.query(
      "SELECT * FROM users WHERE username = $1 OR email = $1",
      [username],
    );

    if (userResult.rows.length === 0) {
      res.status(400).json({ error: "Invalid username or password" });
      return;
    }

    const user = userResult.rows[0];

    // 3. Compare password with the stored hash using bcryptjs
    const isMatch = await bcrypt.compare(password, user.password_hash);

    if (!isMatch) {
      res.status(400).json({ error: "Invalid username or password" });
      return;
    }

    // 4. Send back user details matching frontend Pinia store expectations
    const token = jwt.sign(
      {
        userId: user.user_id,
        username: user.username,
        role: user.role,
      },
      process.env.JWT_SECRET!,
      {
        expiresIn: "1d",
      },
    );

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.COOKIE_SECURE === "true" ,
      sameSite: "lax",
      maxAge: 24 * 60 * 60 * 1000,
      path: "/",
    });

    res.status(200).json({
      message: "Login successful!",
      userId: user.user_id,
      username: user.username,
      role: user.role,
    });

  } catch (err: any) {
    console.error("Login error:", err.message);
    res.status(500).json({ error: "Server error during login" });
  }
});

export default router;
