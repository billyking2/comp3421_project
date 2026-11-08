import { Router, Request, Response } from 'express';
import pool from '../config/db';
import { requireAdmin, requireAuth } from '../controllers/requireAuth';

const router = Router();

router.post('/changeBook', requireAuth, requireAdmin, async (req: Request, res: Response) => {
  try {
    const { bookId, price , stock_quantity} = req.body;

    if (!bookId || price < 0 ||stock_quantity < 0) {
        return res.status(400).json({
          error: 'Invalid data',
        });
      }

    const result = await pool.query(`
      UPDATE books
      SET
        price = $1,
        stock_quantity = $2
      WHERE book_id = $3;
    `,
    [price, stock_quantity, bookId]
    );

    res.json(result);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      error: 'Failed to fetch books',
    });
  }
});

export default router;