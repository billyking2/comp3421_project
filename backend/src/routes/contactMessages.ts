import { Router, Request, Response } from 'express';
import pool from '../config/db';
import { requireAdmin, requireAuth } from '../controllers/requireAuth';
import { CONTACT_EMAIL_MAX_LENGTH, isValidEmail } from '../utils/validation';

const router = Router();

router.post('/contact', async (req: Request, res: Response): Promise<void> => {
  if (typeof req.body !== 'object' || req.body === null || Array.isArray(req.body)) {
    res.status(400).json({ error: 'Name, email, and message are required' });
    return;
  }

  const { name, email, message } = req.body as Record<string, unknown>;

  if (
    typeof name !== 'string' ||
    typeof email !== 'string' ||
    typeof message !== 'string'
  ) {
    res.status(400).json({ error: 'Name, email, and message are required' });
    return;
  }

  const cleanName = name.trim();
  const cleanEmail = email.trim();
  const cleanMessage = message.trim();

  if (
    !cleanName ||
    cleanName.length > 100 ||
    !isValidEmail(cleanEmail, CONTACT_EMAIL_MAX_LENGTH) ||
    !cleanMessage ||
    cleanMessage.length > 10000
  ) {
    res.status(400).json({ error: 'Please provide valid contact details and a message' });
    return;
  }

  try {
    await pool.query(
      `INSERT INTO contact_messages (name, email, message)
       VALUES ($1, $2, $3)`,
      [cleanName, cleanEmail, cleanMessage],
    );

    res.status(201).json({ message: 'Message sent successfully.' });
  } catch (error) {
    console.error('Contact message submission failed:', error);
    res.status(500).json({ error: 'Failed to send message' });
  }
});

router.get(
  '/admin/contact-messages',
  requireAuth,
  requireAdmin,
  async (_req: Request, res: Response): Promise<void> => {
    try {
      const result = await pool.query(
        `SELECT id, name, email, message, "read", created_at
         FROM contact_messages
         ORDER BY created_at DESC, id DESC`,
      );

      res.json(result.rows);
    } catch (error) {
      console.error('Contact messages lookup failed:', error);
      res.status(500).json({ error: 'Failed to load contact messages' });
    }
  },
);

router.patch(
  '/admin/contact-messages/:id/read',
  requireAuth,
  requireAdmin,
  async (req: Request, res: Response): Promise<void> => {
    const id = Number(req.params.id);
    if (!Number.isSafeInteger(id) || id < 1) {
      res.status(400).json({ error: 'Invalid message ID' });
      return;
    }

    try {
      const result = await pool.query(
        `UPDATE contact_messages
         SET "read" = TRUE
         WHERE id = $1
         RETURNING id`,
        [id],
      );

      if (result.rowCount === 0) {
        res.status(404).json({ error: 'Contact message not found' });
        return;
      }

      res.json({ message: 'Message marked as read' });
    } catch (error) {
      console.error('Contact message update failed:', error);
      res.status(500).json({ error: 'Failed to update contact message' });
    }
  },
);

router.delete(
  '/admin/contact-messages/:id',
  requireAuth,
  requireAdmin,
  async (req: Request, res: Response): Promise<void> => {
    const id = Number(req.params.id);
    if (!Number.isSafeInteger(id) || id < 1) {
      res.status(400).json({ error: 'Invalid message ID' });
      return;
    }

    try {
      const result = await pool.query(
        'DELETE FROM contact_messages WHERE id = $1 RETURNING id',
        [id],
      );

      if (result.rowCount === 0) {
        res.status(404).json({ error: 'Contact message not found' });
        return;
      }

      res.json({ message: 'Contact message deleted' });
    } catch (error) {
      console.error('Contact message deletion failed:', error);
      res.status(500).json({ error: 'Failed to delete contact message' });
    }
  },
);

export default router;
