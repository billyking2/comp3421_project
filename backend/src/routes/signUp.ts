import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import pool from '../config/db';
import rateLimit from 'express-rate-limit';
import {
  isValidEmail,
  isValidPassword,
  isValidUsername,
  USER_EMAIL_MAX_LENGTH,
} from '../utils/validation';

const router = Router();

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, 
  max: 100, 
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true, 
  legacyHeaders: false
});
// Register Route
router.post('/signUp', authLimiter, async (req: Request, res: Response): Promise<void> => {
  try {
    if (typeof req.body !== 'object' || req.body === null || Array.isArray(req.body)) {
      res.status(400).json({ error: 'Please provide username, email, and password' });
      return;
    }

    const { username, email, password } = req.body as Record<string, unknown>;

    if (!isValidUsername(username)) {
      res.status(400).json({ error: 'Username must be 1–50 characters' });
      return;
    }

    if (!isValidEmail(email, USER_EMAIL_MAX_LENGTH)) {
      res.status(400).json({ error: 'Please provide a valid email address (maximum 100 characters)' });
      return;
    }

    if (!isValidPassword(password)) {
      res.status(400).json({ error: 'Password must be at least 6 characters and at most 72 bytes' });
      return;
    }

    const cleanUsername = username.trim();
    const cleanEmail = email.trim();

    const existingUser = await pool.query('SELECT * FROM users WHERE email = $1 OR username = $2', [
      cleanEmail,
      cleanUsername,
    ]);

    if (existingUser.rows.length > 0) {
      res.status(400).json({ error: 'Username or email already exists' });
      return;
    }

    const saltRounds = 10;
    const password_hash = await bcrypt.hash(password, saltRounds);

    const newUserQuery = `
      INSERT INTO users (username, email, password_hash, role) 
      VALUES ($1, $2, $3, $4) 
      RETURNING user_id, username, email, role, created_at;
    `;
    const values = [cleanUsername, cleanEmail, password_hash, 'customer'];

    const newResult = await pool.query(newUserQuery, values);

    res.status(201).json({
      message: 'User registered successfully!',
      user: newResult.rows[0],
    });
  } catch (err: unknown) {
    if (
      typeof err === 'object' &&
      err !== null &&
      'code' in err &&
      err.code === '23505'
    ) {
      res.status(409).json({ error: 'Username or email already exists' });
      return;
    }

    console.error('Registration error:', err instanceof Error ? err.message : err);
    res.status(500).json({ error: 'Server error during registration' });
  }
});

export default router;
