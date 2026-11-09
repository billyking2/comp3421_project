import { Router, Request, Response } from 'express';
import pool from '../config/db';
import { AuthenticatedRequest, requireAuth } from '../controllers/requireAuth';

const router = Router();

router.get('/cart', requireAuth, async (req: Request, res: Response): Promise<void> => {
  const userId = getUserId(req, res);
  if (userId === null) return;

  try {
    // Fetch the cart items for the authenticated user
    const result = await pool.query(
      `SELECT
        b.book_id,
        b.title,
        b.author,
        b.price::float AS price,
        b.stock_quantity,
        bi.image_url,
        ci.quantity
      FROM cart_items ci
      JOIN books b ON b.book_id = ci.book_id
      LEFT JOIN LATERAL (
        SELECT image_url
        FROM book_images
        WHERE book_id = b.book_id AND is_primary = TRUE
        ORDER BY image_id
        LIMIT 1
      ) bi ON TRUE
      WHERE ci.user_id = $1
      ORDER BY ci.cart_item_id`,
      [userId],
    );

    res.json(result.rows);
  } catch (error) {
    console.error('Cart lookup failed:', error);
    res.status(500).json({ error: 'Failed to load cart' });
  }
});

router.post('/cart/items', requireAuth, async (req: Request, res: Response): Promise<void> => {
  const userId = getUserId(req, res);
  if (userId === null) return;

  const { bookId, quantity = 1 } = getRequestBody(req);
  const parsedBookId = parsePositiveInteger(bookId);
  const parsedQuantity = parsePositiveInteger(quantity);
  if (parsedBookId === null || parsedQuantity === null) {
    res.status(400).json({ error: 'A valid book ID and quantity are required' });
    return;
  }

  try {
    // Add the item to the cart, ensuring that the stock quantity is sufficient
    const result = await pool.query(
      `INSERT INTO cart_items (user_id, book_id, quantity)
       SELECT $1, b.book_id, $3
       FROM books b
       WHERE b.book_id = $2 AND b.stock_quantity >= $3
       ON CONFLICT (user_id, book_id)
       DO UPDATE SET quantity = cart_items.quantity + EXCLUDED.quantity
       WHERE EXISTS (
         SELECT 1
         FROM books
         WHERE book_id = $2
           AND stock_quantity >= cart_items.quantity + EXCLUDED.quantity
       )
       RETURNING book_id, quantity`,
      [userId, parsedBookId, parsedQuantity],
    );

    if (result.rowCount === 0) {
      await sendBookAvailabilityError(parsedBookId, userId, 'add', res);
      return;
    }

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Adding cart item failed:', error);
    res.status(500).json({ error: 'Failed to add book to cart' });
  }
});

router.put('/cart/items/:bookId', requireAuth, async (req: Request, res: Response): Promise<void> => {
  const userId = getUserId(req, res);
  if (userId === null) return;

  const bookId = parsePositiveInteger(req.params.bookId);
  const quantity = parsePositiveInteger(getRequestBody(req).quantity);
  if (bookId === null || quantity === null) {
    res.status(400).json({ error: 'A valid book ID and quantity are required' });
    return;
  }

  try {
    // Update the quantity of the cart item, ensuring that the stock quantity is sufficient
    const result = await pool.query(
      `UPDATE cart_items ci
       SET quantity = $3
       FROM books b
       WHERE ci.user_id = $1
         AND ci.book_id = $2
         AND b.book_id = ci.book_id
         AND b.stock_quantity >= $3
       RETURNING ci.book_id, ci.quantity`,
      [userId, bookId, quantity],
    );

    if (result.rowCount === 0) {
      const itemExists = await pool.query(
        'SELECT 1 FROM cart_items WHERE user_id = $1 AND book_id = $2',
        [userId, bookId],
      );
      if (itemExists.rowCount === 0) {
        res.status(404).json({ error: 'Cart item not found' });
        return;
      }

      await sendBookAvailabilityError(bookId, userId, 'set', res);
      return;
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Cart item quantity update failed:', error);
    res.status(500).json({ error: 'Failed to update cart item' });
  }
});

// Delete all items from the cart for the authenticated user
router.delete('/cart/items', requireAuth, async (req: Request, res: Response): Promise<void> => {
  const userId = getUserId(req, res);
  if (userId === null) return;

  try {
    await pool.query('DELETE FROM cart_items WHERE user_id = $1', [userId]);
    res.status(204).end();
  } catch (error) {
    console.error('Cart clearing failed:', error);
    res.status(500).json({ error: 'Failed to clear cart' });
  }
});

//  Delete a specific item from the cart for the authenticated user
router.delete('/cart/items/:bookId', requireAuth, async (req: Request, res: Response): Promise<void> => {
  const userId = getUserId(req, res);
  if (userId === null) return;

  const bookId = parsePositiveInteger(req.params.bookId);
  if (bookId === null) {
    res.status(400).json({ error: 'A valid book ID is required' });
    return;
  }

  try {
    const result = await pool.query(
      'DELETE FROM cart_items WHERE user_id = $1 AND book_id = $2 RETURNING book_id',
      [userId, bookId],
    );

    if (result.rowCount === 0) {
      res.status(404).json({ error: 'Cart item not found' });
      return;
    }

    res.status(204).end();
  } catch (error) {
    console.error('Cart item deletion failed:', error);
    res.status(500).json({ error: 'Failed to remove cart item' });
  }
});

function getUserId(req: Request, res: Response): number | null {
  const userId = (req as AuthenticatedRequest).user?.userId;
  const parsedUserId = typeof userId === 'string' ? Number(userId) : userId;

  if (
    typeof parsedUserId !== 'number' ||
    !Number.isSafeInteger(parsedUserId) ||
    parsedUserId < 1
  ) {
    res.status(401).json({ error: 'Invalid authentication token' });
    return null;
  }

  return parsedUserId;
}

function getRequestBody(req: Request): Record<string, unknown> {
  return typeof req.body === 'object' && req.body !== null && !Array.isArray(req.body)
    ? req.body as Record<string, unknown>
    : {};
}

function parsePositiveInteger(value: unknown): number | null {
  const parsedValue = typeof value === 'string' && value.trim() ? Number(value) : value;
  return typeof parsedValue === 'number' &&
    Number.isSafeInteger(parsedValue) &&
    parsedValue > 0
    ? parsedValue
    : null;
}

// Send a 409 Conflict response with the available stock quantity for the specified book and user
async function sendBookAvailabilityError(
  bookId: number,
  userId: number,
  operation: 'add' | 'set',
  res: Response,
): Promise<void> {
  const result = await pool.query(
    `SELECT
      b.stock_quantity,
      COALESCE(ci.quantity, 0) AS quantity_in_cart
     FROM books b
     LEFT JOIN cart_items ci
       ON ci.book_id = b.book_id AND ci.user_id = $2
     WHERE b.book_id = $1`,
    [bookId, userId],
  );

  if (result.rowCount === 0) {
    res.status(404).json({ error: 'Book not found' });
    return;
  }

  const { stock_quantity: stock, quantity_in_cart: inCart } = result.rows[0] as {
    stock_quantity: number;
    quantity_in_cart: number;
  };
  const available = operation === 'add' ? Math.max(stock - inCart, 0) : stock;
  res.status(409).json({ error: `Only ${available} book(s) can be selected at this time` });
}

export default router;
