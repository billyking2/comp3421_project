import api from "./api";

export interface DashboardBookData {
  book_id: number;
  title: string;
  author: string;
  price: number;
  stock_quantity: number;
  image_url: string | null;
  categories: string;
}

export interface DashboardUser {
  user_id: number;
  username: string;
  email: string;
  role: string;
  created_at: string;
  order_count: number;
  monetary: number;
  last_order_at: string | null;
  days_since_last_order: number | null;
}

export interface DashboardOrderItem {
  book_id: number | null;
  title: string;
  quantity: number;
  unit_price: number;
}

export interface DashboardOrder {
  order_id: number;
  user_id: number | null;
  customer_name: string;
  total_amount: number;
  payment_status: 'paid' | 'not paid';
  created_at: string;
  items: DashboardOrderItem[];
}

export async function getToday(
  threshold: number = 5
) {
  return api.get("/api/get/getToday", {
    params: {
      threshold,
    },
  });
}

export async function getBook(
  threshold: number = 5
) {
  return api.get("/api/get/getBook", {
    params: {
      threshold,
    },
  });
}

export async function changeBook(
  bookId: number,
  price: number,
  stock_quantity: number,
) {
    return api.post("/api/post/changeBook",{
        bookId,
        price,
        stock_quantity,
    });
}

export async function getUsers() {
  return api.get<DashboardUser[]>("/api/get/getUsers");
}

export async function getOrders() {
  return api.get<DashboardOrder[]>("/api/get/getOrders");
}