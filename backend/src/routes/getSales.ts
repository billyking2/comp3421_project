import { Router } from 'express';
import pool from '../config/db';
import { requireAdmin, requireAuth } from '../controllers/requireAuth';
const router = Router();

router.get('/getSales', requireAuth, requireAdmin, async (_req, res) => {
  try {
    const [summary, monthlySales, bestSellingBooks] = await Promise.all([
      pool.query(`
        SELECT
          COUNT(*)::int AS total_orders,
          COALESCE(SUM(total_amount), 0)::float AS revenue,
          COALESCE(AVG(total_amount), 0)::float AS average_order_value
        FROM orders
        WHERE payment_status = 'paid'
      `),
      pool.query(`
        WITH months AS (
          SELECT generate_series(
            date_trunc('month', CURRENT_DATE) - INTERVAL '11 months',
            date_trunc('month', CURRENT_DATE),
            INTERVAL '1 month'
          ) AS month
        ),
        sales AS (
          SELECT
            date_trunc('month', created_at) AS month,
            SUM(total_amount)::float AS revenue,
            COUNT(*)::int AS order_count
          FROM orders
          WHERE payment_status = 'paid'
            AND created_at >= date_trunc('month', CURRENT_DATE) - INTERVAL '11 months'
            AND created_at < date_trunc('month', CURRENT_DATE) + INTERVAL '1 month'
          GROUP BY date_trunc('month', created_at)
        )
        SELECT
          TO_CHAR(months.month, 'YYYY-MM') AS month,
          COALESCE(sales.revenue, 0)::float AS revenue,
          COALESCE(sales.order_count, 0)::int AS order_count
        FROM months
        LEFT JOIN sales USING (month)
        ORDER BY months.month
      `),
      pool.query(`
        SELECT
          b.book_id,
          COALESCE(b.title, 'Deleted book') AS title,
          SUM(oi.quantity)::int AS units_sold,
          SUM(oi.quantity * oi.unit_price)::float AS revenue
        FROM order_items oi
        JOIN orders o ON o.order_id = oi.order_id
        LEFT JOIN books b ON b.book_id = oi.book_id
        WHERE o.payment_status = 'paid'
        GROUP BY b.book_id, b.title
        ORDER BY units_sold DESC, revenue DESC, title
        LIMIT 10
      `),
    ]);

    res.json({
      summary: summary.rows[0],
      monthlySales: monthlySales.rows,
      bestSellingBooks: bestSellingBooks.rows,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch sales analytics' });
  }
});

export default router;
