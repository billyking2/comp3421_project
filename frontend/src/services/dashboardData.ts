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

export interface SalesAnalytics {
  summary: {
    total_orders: number;
    revenue: number;
    average_order_value: number;
  };
  monthlySales: {
    month: string;
    revenue: number;
    order_count: number;
  }[];
  bestSellingBooks: {
    book_id: number | null;
    title: string;
    units_sold: number;
    revenue: number;
  }[];
}

export interface PopularBookData {
  book_id: number | null;
  title: string;
  units_sold: number;
  revenue: number;
}

export interface ContactMessage {
  id: number;
  name: string;
  email: string;
  message: string;
  read: boolean;
  created_at: string;
}

export async function sendContactMessage(input: {
  name: string;
  email: string;
  message: string;
}) {
  return api.post<{ message: string }>('/api/contact', input);
}

export async function getContactMessages() {
  return api.get<ContactMessage[]>('/api/admin/contact-messages');
}

export async function markContactMessageRead(id: number) {
  return api.patch<{ message: string }>(`/api/admin/contact-messages/${id}/read`);
}

export async function deleteContactMessage(id: number) {
  return api.delete<{ message: string }>(`/api/admin/contact-messages/${id}`);
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
  return api.get<DashboardBookData[]>("/api/get/getBook", {
    params: {
      threshold,
    },
  });
}

export async function getCategories() {
  return api.get<string[]>("/api/get/getCategories");
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

export async function getSales() {
  return api.get<SalesAnalytics>("/api/get/getSales");
}

export async function getPopularBook() {
  return api.get<PopularBookData[]>("/api/get/popularBook");
}