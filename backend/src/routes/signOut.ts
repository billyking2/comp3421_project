import { Router, Request, Response } from "express";
import bcrypt from "bcryptjs";
import pool from "../config/db";
import jwt from "jsonwebtoken";
import {requireAuth} from "../controllers/requireAuth"

const router = Router();

router.post('/signOut', (req, res) => {
   try{ res.clearCookie('token');

    res.json({
        success: true,
        message: 'Signed out successfully'
    });
}
    catch (err: any) {
    console.error("SignOut error:", err.message);
    res.status(500).json({ error: "Server error during SignOut" });
  }
});

export default router;
