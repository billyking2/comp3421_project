import { Router, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import type { PoolClient } from 'pg';
import pool from '../config/db';

type PaymentChoice = 'pay_now' | 'order_only';

interface CheckoutItem {
  bookId: number;
  quantity: number;
}

interface CheckoutBook {
  book_id: number;
  title: string;
  price: string | number;
  stock_quantity: number;
}

class CheckoutError extends Error {
  constructor(
    message: string,
    readonly statusCode: number,
  ) {
    super(message);
  }
}

const router = Router();

router.post('/checkout', async (req: Request, res: Response): Promise<void> => {
  const paymentChoice = getPaymentChoice(req.body?.paymentChoice);
  if (paymentChoice === null) {
    res.status(400).json({ error: 'Choose whether to pay now or place the order unpaid' });
    return;
  }

  const userId = getOptionalUserId(req, res);
  if (userId === undefined) return;

  let guestItems: CheckoutItem[] = [];
  if (userId === null) {
    const parsedItems = parseCheckoutItems(req.body?.items);
    if (!parsedItems) {
      res.status(400).json({ error: 'Your cart must contain valid book IDs and quantities' });
      return;
    }
    guestItems = parsedItems;
  }

  // Connect to the database and start a transaction
  let client: PoolClient;
  try {
    client = await pool.connect();
  } catch (error) {
    console.error('Order checkout database connection failed:', error);
    res.status(500).json({ error: 'Failed to place order' });
    return;
  }

  let transactionStarted = false;

  try {
    await client.query('BEGIN');
    transactionStarted = true;

    const checkoutItems =
      userId === null
        ? guestItems
        : await getAccountCartItems(client, userId);

    if (checkoutItems.length === 0) {
      throw new CheckoutError('Your cart is empty', 400);
    }

    // Fetch the book details for the checkout items, locking the rows for update
    const bookIds = checkoutItems.map((item) => item.bookId);
    const bookResult = await client.query<CheckoutBook>(
      `SELECT book_id, title, price, stock_quantity
       FROM books
       WHERE book_id = ANY($1::int[])
       ORDER BY book_id
       FOR UPDATE`,
      [bookIds],
    );

    if (bookResult.rowCount !== checkoutItems.length) {
      throw new CheckoutError('One or more books are no longer available', 409);
    }

    // Create a map of book_id to book details for easy lookup
    const booksById = new Map(bookResult.rows.map((book) => [book.book_id, book]));
    let totalCents = 0;
    const orderLines = checkoutItems.map((item) => {
      const book = booksById.get(item.bookId);
      if (!book) {
        throw new CheckoutError('One or more books are no longer available', 409);
      }

      if (item.quantity > book.stock_quantity) {
        throw new CheckoutError(
          `Only ${book.stock_quantity} copy/copies of "${book.title}" are in stock`,
          409,
        );
      }

      const unitPrice = Number(book.price);
      totalCents += Math.round(unitPrice * 100) * item.quantity;
      return { ...item, unitPrice };
    });

    if (!Number.isSafeInteger(totalCents) || totalCents > 9_999_999_999) {
      throw new CheckoutError('The order total is outside the supported range', 400);
    }
    if (totalCents <= 0) {
      throw new CheckoutError('The order total must be greater than zero', 400);
    }

    // Lock the orders and order_items tables to prevent concurrent inserts that could cause primary key conflicts
    await client.query('LOCK TABLE orders, order_items IN EXCLUSIVE MODE');
    // Reset the sequences for orders and order_items to avoid primary key conflicts
    await client.query(
      `SELECT setval(
        pg_get_serial_sequence('orders', 'order_id'),
        COALESCE(MAX(order_id), 0) + 1,
        false
      ) FROM orders`,
    );
    // Reset the sequence for order_items to avoid primary key conflicts
    await client.query(
      `SELECT setval(
        pg_get_serial_sequence('order_items', 'order_item_id'),
        COALESCE(MAX(order_item_id), 0) + 1,
        false
      ) FROM order_items`,
    );

    const totalAmount = totalCents / 100;
    const paymentStatus = paymentChoice === 'pay_now' ? 'paid' : 'not paid';
    // Insert the order into the database and get the generated order_id
    const orderResult = await client.query<{ order_id: number }>(
      `INSERT INTO orders (user_id, total_amount, payment_status)
       VALUES ($1, $2, $3)
       RETURNING order_id`,
      [userId, totalAmount.toFixed(2), paymentStatus],
    );
    const orderId = orderResult.rows[0].order_id;

    // Update the stock quantities and insert the order items into the database
    for (const item of orderLines) {
      await client.query(
        `UPDATE books
         SET stock_quantity = stock_quantity - $1
         WHERE book_id = $2`,
        [item.quantity, item.bookId],
      );
      await client.query(
        `INSERT INTO order_items (order_id, book_id, quantity, unit_price)
         VALUES ($1, $2, $3, $4)`,
        [orderId, item.bookId, item.quantity, item.unitPrice],
      );
    }

    if (userId !== null) {
      await client.query('DELETE FROM cart_items WHERE user_id = $1', [userId]);
    }

    // Commit the transaction and send the response
    await client.query('COMMIT');
    transactionStarted = false;
    res.status(201).json({
      order_id: orderId,
      total_amount: Number(totalAmount.toFixed(2)),
      payment_status: paymentStatus,
    });
  } catch (error) {
    if (transactionStarted) {
      try {
        await client.query('ROLLBACK');
      } catch (rollbackError) {
        console.error('Order checkout rollback failed:', rollbackError);
      }
    }

    if (error instanceof CheckoutError) {
      res.status(error.statusCode).json({ error: error.message });
      return;
    }

    console.error('Order checkout failed:', error);
    res.status(500).json({ error: 'Failed to place order' });
  } finally {
    client.release();
  }
});

// Get the cart items for a signed-in user from the database, locking the rows for update. Returns an empty array if the user has no items in their cart.
async function getAccountCartItems(
  client: PoolClient,
  userId: number,
): Promise<CheckoutItem[]> {
  const result = await client.query<{ book_id: number; quantity: number }>(
    `SELECT book_id, quantity
     FROM cart_items
     WHERE user_id = $1
     ORDER BY book_id
     FOR UPDATE`,
    [userId],
  );

  return result.rows.map((item) => ({
    bookId: item.book_id,
    quantity: item.quantity,
  }));
}

// get the userId from the JWT token in the cookie, or return null if not signed in. If the token is invalid, send a 401 response and return undefined.
function getOptionalUserId(req: Request, res: Response): number | null | undefined {
  const token: unknown = req.cookies?.token;
  if (token === undefined) return null;
  if (typeof token !== 'string' || !process.env.JWT_SECRET) {
    res.status(401).json({ error: 'Invalid authentication token' });
    return undefined;
  }

  try {
    // Verify the JWT token and extract the payload
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    if (
      typeof payload === 'string' ||
      typeof payload.userId !== 'number' ||
      !Number.isSafeInteger(payload.userId) ||
      payload.userId < 1
    ) {
      res.status(401).json({ error: 'Invalid authentication token' });
      return undefined;
    }
    return payload.userId;
  } catch {
    res.status(401).json({ error: 'Invalid authentication token' });
    return undefined;
  }
}

function getPaymentChoice(value: unknown): PaymentChoice | null {
  return value === 'pay_now' || value === 'order_only' ? value : null;
}

// Parse the checkout items from the request body. Returns null if the input is invalid.
function parseCheckoutItems(value: unknown): CheckoutItem[] | null {
  if (!Array.isArray(value) || value.length === 0 || value.length > 100) return null;

  const quantitiesByBookId = new Map<number, number>();
  for (const entry of value) {
    if (typeof entry !== 'object' || entry === null || Array.isArray(entry)) return null;

    const item = entry as Record<string, unknown>;
    const bookId = parsePositiveInteger(item.bookId);
    const quantity = parsePositiveInteger(item.quantity);
    if (bookId === null || quantity === null) return null;

    const combinedQuantity = (quantitiesByBookId.get(bookId) ?? 0) + quantity;
    if (!Number.isSafeInteger(combinedQuantity)) return null;
    quantitiesByBookId.set(bookId, combinedQuantity);
  }

  return Array.from(quantitiesByBookId, ([bookId, quantity]) => ({ bookId, quantity }));
}

function parsePositiveInteger(value: unknown): number | null {
  return typeof value === 'number' && Number.isSafeInteger(value) && value > 0
    ? value
    : null;
}

export default router;
