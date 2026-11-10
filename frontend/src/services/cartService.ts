import api from './api';
import type { BookData } from './Data';

export interface CartItem {
  book_id: number;
  title: string;
  author: string;
  price: number;
  stock_quantity: number;
  image_url: string | null;
  quantity: number;
}

export interface CreatedOrder {
  order_id: number;
  total_amount: number;
  payment_status: 'paid' | 'not paid';
}

const GUEST_CART_KEY = 'guest-cart';

// Fetch the signed-in user's cart from the backend.
export async function getCart() {
  return api.get<CartItem[]>('/api/cart');
}

// Add a book and quantity to the signed-in user's cart.
export async function addCartItem(bookId: number, quantity: number = 1) {
  return api.post<{ book_id: number; quantity: number }>('/api/cart/items', {
    bookId,
    quantity,
  });
}

// Set the signed-in user's cart quantity for a book.
export async function updateCartItem(bookId: number, quantity: number) {
  return api.put<{ book_id: number; quantity: number }>(`/api/cart/items/${bookId}`, {
    quantity,
  });
}

// Remove a book from the signed-in user's cart.
export async function removeCartItem(bookId: number) {
  return api.delete(`/api/cart/items/${bookId}`);
}

// Create an order from the signed-in cart or the guest cart's book IDs and quantities.
export async function createOrder(
  paymentChoice: 'pay_now' | 'order_only',
  items?: Pick<CartItem, 'book_id' | 'quantity'>[],
) {
  return api.post<CreatedOrder>('/api/checkout', {
    paymentChoice,
    ...(items ? {
      items: items.map((item) => ({
        bookId: item.book_id,
        quantity: item.quantity,
      })),
    } : {}),
  });
}

// Read and validate the guest cart saved in browser storage.
export function getGuestCart(): CartItem[] {
  const savedCart = localStorage.getItem(GUEST_CART_KEY);
  if (savedCart === null) return [];

  try {
    const parsedCart: unknown = JSON.parse(savedCart);

    if (!Array.isArray(parsedCart) || !parsedCart.every(isCartItem)) {
      localStorage.removeItem(GUEST_CART_KEY);
      return [];
    }

    return parsedCart;
  } catch {
    localStorage.removeItem(GUEST_CART_KEY);
    return [];
  }
}

// Persist the guest cart in browser storage.
export function saveGuestCart(items: CartItem[]): void {
  localStorage.setItem(GUEST_CART_KEY, JSON.stringify(items));
}

// Add a book to the guest cart while enforcing its stock limit.
export function addGuestCartItem(
  items: CartItem[],
  book: BookData,
  quantity: number = 1,
): CartItem[] {
  const existingItem = items.find(({ book_id }) => book_id === book.book_id);
  const nextQuantity = (existingItem?.quantity ?? 0) + quantity;

  if (!Number.isSafeInteger(quantity) || quantity < 1 || nextQuantity > book.stock_quantity) {
    throw new Error(`Only ${book.stock_quantity} book(s) are currently in stock.`);
  }

  const updatedItem: CartItem = {
    book_id: book.book_id,
    title: book.title,
    author: book.author,
    price: Number(book.price),
    stock_quantity: book.stock_quantity,
    image_url: book.image_url,
    quantity: nextQuantity,
  };

  return existingItem
    ? items.map((item) => item.book_id === book.book_id ? updatedItem : item)
    : [...items, updatedItem];
}

// Change a guest cart item's quantity while enforcing its stock limit.
export function updateGuestCartItem(
  items: CartItem[],
  bookId: number,
  quantity: number,
): CartItem[] {
  return items.map((item) => {
    if (item.book_id !== bookId) return item;
    if (!Number.isSafeInteger(quantity) || quantity < 1 || quantity > item.stock_quantity) {
      throw new Error(`Only ${item.stock_quantity} book(s) are currently in stock.`);
    }

    return { ...item, quantity };
  });
}

// Remove a book from the guest cart.
export function removeGuestCartItem(items: CartItem[], bookId: number): CartItem[] {
  return items.filter((item) => item.book_id !== bookId);
}

// Verify that data loaded from browser storage has the expected cart item shape.
function isCartItem(value: unknown): value is CartItem {
  if (typeof value !== 'object' || value === null) return false;
  const item = value as Record<string, unknown>;

  return typeof item.book_id === 'number' &&
    Number.isSafeInteger(item.book_id) &&
    item.book_id > 0 &&
    typeof item.title === 'string' &&
    typeof item.author === 'string' &&
    typeof item.price === 'number' &&
    Number.isFinite(item.price) &&
    typeof item.stock_quantity === 'number' &&
    Number.isSafeInteger(item.stock_quantity) &&
    item.stock_quantity >= 0 &&
    (typeof item.image_url === 'string' || item.image_url === null) &&
    typeof item.quantity === 'number' &&
    Number.isSafeInteger(item.quantity) &&
    item.quantity > 0;
}
