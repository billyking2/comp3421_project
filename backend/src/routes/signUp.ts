import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import pool from '../config/db';

const router = Router();

// Register Route
router.post('/signUp', async (req: Request, res: Response): Promise<void> => {
  try {
    const { username, email, password, role } = req.body;

    // 1. Basic validation
    if (!username || !email || !password) {
      res.status(400).json({ error: 'Please provide username, email, and password' });
      return;
    }

    // 2. Check if user already exists
    const existingUser = await pool.query(
      'SELECT * FROM users WHERE email = $1 OR username = $2', 
      [email, username]
    );
    
    if (existingUser.rows.length > 0) {
      res.status(400).json({ error: 'Username or email already exists' });
      return;
    }

    // 3. Hash the password with bcryptjs (automatically generates a secure salt)
    const saltRounds = 10;
    const password_hash = await bcrypt.hash(password, saltRounds);

    // 4. Insert user into PostgreSQL using parameterized queries ($1, $2...) for SQL injection safety
    const newUserQuery = `
      INSERT INTO users (username, email, password_hash, role) 
      VALUES ($1, $2, $3, $4) 
      RETURNING user_id, username, email, role, created_at;
    `;
    const userRole = role || 'customer';
    const values = [username, email, password_hash, userRole];

    const newResult = await pool.query(newUserQuery, values);

    res.status(201).json({
      message: 'User registered successfully!',
      user: newResult.rows[0]
    });
  } catch (err: any) {
    console.error('Registration error:', err.message);
    res.status(500).json({ error: 'Server error during registration' });
  }
});

export default router;