import { Router, Request, Response } from 'express';
import pool from '../config/db';
import { requireAdmin, requireAuth } from '../controllers/requireAuth';

const router = Router();

router.post('/changeBook', requireAuth, requireAdmin, async (req: Request, res: Response) => {
  try {

    const book_Id = Number(req.body?.bookId);
    const prices = Number(req.body?.price);
    const stock = Number(req.body?.stock_quantity);

    if (!Number.isSafeInteger(book_Id) || book_Id < 1) {
      return res.status(400).json({ error: 'Invalid book id' });
    }
    if (!Number.isFinite(prices) || prices < 0 || prices > 99_999_999.99) {
      return res.status(400).json({ error: 'Invalid price' });
    }
    if (!Number.isSafeInteger(stock) || stock < 0 || stock > 1_000_000) {
      return res.status(400).json({ error: 'Invalid stock quantity' });
    }

    const result = await pool.query(`
      UPDATE books
      SET
        price = $1,
        stock_quantity = $2
      WHERE book_id = $3;
    `,
    [prices, stock, book_Id]
    );

    if (result.rowCount === 0) return res.status(404).json({ error: 'Book not found' });

    res.json(result.rows[0]);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      error: 'Failed to fetch books',
    });
  }
});

export default router;