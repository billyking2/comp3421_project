import { Router, Request, Response } from 'express';
import pool from '../config/db';
import { AuthenticatedRequest, requireAuth } from '../controllers/requireAuth';

const router = Router();

router.post('/changeMyOrders', requireAuth, async (req: Request, res: Response): Promise<void> => {
  const userId = (req as AuthenticatedRequest).user?.userId;
  const parsedUserId = typeof userId === 'string' ? Number(userId) : userId;
  const orderId = typeof req.body?.orderId === 'string'
    ? Number(req.body.orderId)
    : req.body?.orderId;

  if (
    typeof parsedUserId !== 'number' ||
    !Number.isSafeInteger(parsedUserId) ||
    parsedUserId < 1
  ) {
    res.status(401).json({ error: 'Invalid authentication token' });
    return;
  }

  if (typeof orderId !== 'number' || !Number.isSafeInteger(orderId) || orderId < 1) {
    res.status(400).json({ error: 'A valid order ID is required' });
    return;
  }

  try {
    const result = await pool.query(
      `UPDATE orders
       SET payment_status = 'paid'
       WHERE order_id = $1 AND user_id = $2 AND payment_status = 'not paid'
       RETURNING order_id, payment_status`,
      [orderId, parsedUserId],
    );

    if (result.rowCount === 0) {
      res.status(404).json({ error: 'Unpaid order not found' });
      return;
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Failed to update order payment status:', error);
    res.status(500).json({ error: 'Failed to update payment status' });
  }
});

export default router;