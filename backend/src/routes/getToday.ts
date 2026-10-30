import { Router } from 'express';
import pool from '../config/db';

const router = Router();

router.get('/getToday', async (req, res) => {
  try {
    const threshold = Number(req.query.threshold) || 5;

    const [
      todayOrders,
      yesterdayOrders,
      todaySales,
      yesterdaySales,
      todayMembers,
      yesterdayMembers,
      emergencyInventory,
    ] = await Promise.all([
      pool.query(`
        SELECT COUNT(*) AS count
        FROM orders
        WHERE DATE(created_at) = CURRENT_DATE
      `),

      pool.query(`
        SELECT COUNT(*) AS count
        FROM orders
        WHERE DATE(created_at) = CURRENT_DATE - INTERVAL '1 day'
      `),

      pool.query(`
        SELECT COALESCE(SUM(total_amount), 0) AS total
        FROM orders
        WHERE DATE(created_at) = CURRENT_DATE
        AND payment_status = 'paid'
      `),

      pool.query(`
        SELECT COALESCE(SUM(total_amount), 0) AS total
        FROM orders
        WHERE DATE(created_at) = CURRENT_DATE - INTERVAL '1 day'
        AND payment_status = 'paid'
      `),

      pool.query(`
        SELECT COUNT(*) AS count
        FROM users
        WHERE DATE(created_at) = CURRENT_DATE
      `),

      pool.query(`
        SELECT COUNT(*) AS count
        FROM users
        WHERE DATE(created_at) = CURRENT_DATE - INTERVAL '1 day'
      `),

      pool.query(
        `
        SELECT COUNT(*) AS count
        FROM books
        WHERE stock_quantity < $1
        `,
        [threshold],
      ),
    ]);

    res.json({
      today: {
        orders: Number(todayOrders.rows[0].count),
        sales: Number(todaySales.rows[0].total),
        members: Number(todayMembers.rows[0].count),
      },

      yesterday: {
        orders: Number(yesterdayOrders.rows[0].count),
        sales: Number(yesterdaySales.rows[0].total),
        members: Number(yesterdayMembers.rows[0].count),
      },

      emergencyInventory: Number(emergencyInventory.rows[0].count),
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: 'Failed to fetch dashboard data',
    });
  }
});

export default router;
