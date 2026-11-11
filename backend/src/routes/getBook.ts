import { Router, Request, Response } from 'express';
import pool from '../config/db';

const router = Router();

router.get('/getBook', async (_req: Request, res: Response) => {
  try {
    const result = await pool.query(`
      SELECT
        b.book_id,
        b.title,
        b.author,
        b.price,
        b.stock_quantity,
        b.description,

        bi.image_url,

        STRING_AGG(c.name, ', ') AS categories

      FROM books b

      LEFT JOIN book_images bi
        ON b.book_id = bi.book_id
        AND bi.is_primary = TRUE

      LEFT JOIN book_categories bc
        ON b.book_id = bc.book_id

      LEFT JOIN categories c
        ON bc.category_id = c.category_id

      GROUP BY
        b.book_id,
        bi.image_url

      ORDER BY
        b.book_id;
    `);

    res.json(result.rows);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      error: 'Failed to fetch books',
    });
  }
});

router.get('/popularBook', async (_req: Request, res: Response) => {
   try {
    const result = await pool.query(`
      SELECT
          b.book_id,
          COALESCE(b.title, 'Deleted book') AS title,
          SUM(oi.quantity)::int AS units_sold
        FROM order_items oi
        JOIN orders o ON o.order_id = oi.order_id
        LEFT JOIN books b ON b.book_id = oi.book_id
        WHERE o.payment_status = 'paid'
        GROUP BY b.book_id, b.title
        ORDER BY units_sold DESC, title
        LIMIT 3;
    `);

    res.json(result.rows)
  } catch (error) {
    console.error(error);

    res.status(500).json({
      error: 'Failed to fetch popular books',
    });
  }
});

export default router;