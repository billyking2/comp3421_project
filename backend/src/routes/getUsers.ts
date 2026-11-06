import { Router, Request, Response } from 'express';
import pool from '../config/db';

const router = Router();

router.get('/getUsers', async (_req: Request, res: Response) => {
  try {
    const result = await pool.query(`
      WITH paid_orders AS (
        SELECT
          user_id,
          COUNT(*)::int AS order_count,
          SUM(total_amount)::float AS monetary,
          MAX(created_at) AS last_order_at
        FROM orders
        WHERE payment_status = 'paid'
        GROUP BY user_id
      )
      SELECT
        u.user_id,
        u.username,
        u.email,
        u.role,
        u.created_at,
        COALESCE(p.order_count, 0)::int AS order_count,
        COALESCE(p.monetary, 0)::float AS monetary,
        p.last_order_at,
        CASE
          WHEN p.last_order_at IS NULL THEN NULL
          ELSE GREATEST(
            0,
            FLOOR(EXTRACT(EPOCH FROM (CURRENT_TIMESTAMP - p.last_order_at)) / 86400)
          )::int
        END AS days_since_last_order
      FROM users u
      LEFT JOIN paid_orders p ON p.user_id = u.user_id
      WHERE u.role = 'customer'
      ORDER BY u.user_id;
    `);

    res.json(result.rows);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      error: 'Failed to fetch users',
    });
  }
});

export default router;