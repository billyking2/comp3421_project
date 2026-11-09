import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import pool from '../config/db';
import { AuthenticatedRequest, requireAuth } from '../controllers/requireAuth';
import {
  isValidEmail,
  isValidPassword,
  isValidUsername,
  USER_EMAIL_MAX_LENGTH,
} from '../utils/validation';

const router = Router();

router.use(requireAuth);

router.get('/profile', async (req: Request, res: Response): Promise<void> => {
  const userId = getUserId(req, res);
  if (userId === null) return;

  try {
    const result = await pool.query(
      `SELECT username, email
       FROM users
       WHERE user_id = $1`,
      [userId],
    );

    if (result.rowCount === 0) {
      res.status(404).json({ error: 'User profile not found' });
      return;
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Profile lookup failed:', error);
    res.status(500).json({ error: 'Failed to load profile' });
  }
});

router.patch('/profile', async (req: Request, res: Response): Promise<void> => {
  const userId = getUserId(req, res);
  if (userId === null) return;

  if (typeof req.body !== 'object' || req.body === null || Array.isArray(req.body)) {
    res.status(400).json({ error: 'Username and email are required' });
    return;
  }

  const { username, email } = req.body as Record<string, unknown>;
  if (typeof username !== 'string' || typeof email !== 'string') {
    res.status(400).json({ error: 'Username and email are required' });
    return;
  }

  if (!isValidUsername(username)) {
    res.status(400).json({ error: 'Username must be 1–50 characters' });
    return;
  }

  if (!isValidEmail(email, USER_EMAIL_MAX_LENGTH)) {
    res.status(400).json({ error: 'Enter a username and valid email address' });
    return;
  }

  const cleanUsername = username.trim();
  const cleanEmail = email.trim();

  try {
    const result = await pool.query(
      `UPDATE users
       SET username = $1, email = $2
       WHERE user_id = $3
       RETURNING username, email, role`,
      [cleanUsername, cleanEmail, userId],
    );

    if (result.rowCount === 0) {
      res.status(404).json({ error: 'User profile not found' });
      return;
    }

    const updatedUser = result.rows[0] as {
      username: string;
      email: string;
      role: string;
    };
    const token = jwt.sign(
      {
        userId,
        username: updatedUser.username,
        role: updatedUser.role,
      },
      process.env.JWT_SECRET!,
      { expiresIn: '1d' },
    );

    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.COOKIE_SECURE === 'true',
      sameSite: 'lax',
      maxAge: 24 * 60 * 60 * 1000,
      path: '/',
    });

    res.json({ username: updatedUser.username, email: updatedUser.email });
  } catch (error) {
    if (
      typeof error === 'object' &&
      error !== null &&
      'code' in error &&
      error.code === '23505'
    ) {
      res.status(409).json({ error: 'Username or email is already in use' });
      return;
    }

    console.error('Profile update failed:', error);
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

router.patch('/profile/password', async (req: Request, res: Response): Promise<void> => {
  const userId = getUserId(req, res);
  if (userId === null) return;

  if (typeof req.body !== 'object' || req.body === null || Array.isArray(req.body)) {
    res.status(400).json({ error: 'Current and new passwords are required' });
    return;
  }

  const { currentPassword, newPassword } = req.body as Record<string, unknown>;
  if (
    typeof currentPassword !== 'string' ||
    !currentPassword ||
    !isValidPassword(newPassword)
  ) {
    res.status(400).json({ error: 'Enter your current password and a new password of at least 6 characters and at most 72 bytes' });
    return;
  }

  try {
    const userResult = await pool.query(
      'SELECT password_hash FROM users WHERE user_id = $1',
      [userId],
    );

    if (userResult.rowCount === 0) {
      res.status(404).json({ error: 'User profile not found' });
      return;
    }

    const currentPasswordMatches = await bcrypt.compare(
      currentPassword,
      userResult.rows[0].password_hash,
    );
    if (!currentPasswordMatches) {
      res.status(400).json({ error: 'Current password is incorrect' });
      return;
    }

    const passwordHash = await bcrypt.hash(newPassword, 10);
    await pool.query(
      'UPDATE users SET password_hash = $1 WHERE user_id = $2',
      [passwordHash, userId],
    );

    res.json({ message: 'Password updated successfully' });
  } catch (error) {
    console.error('Password update failed:', error);
    res.status(500).json({ error: 'Failed to update password' });
  }
});

function getUserId(req: Request, res: Response): number | null {
  const userId = (req as AuthenticatedRequest).user?.userId;
  const parsedUserId = typeof userId === 'string' ? Number(userId) : userId;

  if (
    typeof parsedUserId !== 'number' ||
    !Number.isSafeInteger(parsedUserId) ||
    parsedUserId < 1
  ) {
    res.status(401).json({ error: 'Invalid authentication token' });
    return null;
  }

  return parsedUserId;
}

export default router;
