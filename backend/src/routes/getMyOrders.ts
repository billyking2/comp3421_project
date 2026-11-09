import { Router, Request, Response } from 'express';
import pool from '../config/db';
import { AuthenticatedRequest, requireAuth } from '../controllers/requireAuth';

const router = Router();

router.get('/myOrders', requireAuth, async (req: Request, res: Response): Promise<void> => {
  const userId = (req as AuthenticatedRequest).user?.userId;
  const parsedUserId = typeof userId === 'string' ? Number(userId) : userId;

  if (
    typeof parsedUserId !== 'number' ||
    !Number.isSafeInteger(parsedUserId) ||
    parsedUserId < 1
  ) {
    res.status(401).json({ error: 'Invalid authentication token' });
    return;
  }

  try {
    const result = await pool.query(
      `SELECT
        o.order_id,
        o.user_id,
        COALESCE(u.username, 'Deleted customer') AS customer_name,
        o.total_amount::float AS total_amount,
        o.payment_status,
        o.created_at,
        COALESCE(
          json_agg(
            json_build_object(
              'book_id', oi.book_id,
              'title', COALESCE(b.title, 'Deleted book'),
              'quantity', oi.quantity,
              'unit_price', oi.unit_price::float
            )
            ORDER BY oi.order_item_id
          ) FILTER (WHERE oi.order_item_id IS NOT NULL),
          '[]'::json
        ) AS items
      FROM orders o
      LEFT JOIN users u ON u.user_id = o.user_id
      LEFT JOIN order_items oi ON oi.order_id = o.order_id
      LEFT JOIN books b ON b.book_id = oi.book_id
      WHERE o.user_id = $1
      GROUP BY o.order_id, u.username
      ORDER BY o.created_at DESC, o.order_id DESC`,
      [parsedUserId],
    );

    res.json(result.rows);
  } catch (error) {
    console.error('Failed to fetch customer orders:', error);
    res.status(500).json({ error: 'Failed to fetch your orders' });
  }
});

export default router;
