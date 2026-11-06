import { defineStore } from 'pinia';
import { getBook, type DashboardBookData } from '../services/dashboardData';

export type BookData = DashboardBookData;

export const useDashboardDataBookStore = defineStore(
  'dashboardDataBook',
  {
    state: () => ({
      books: [] as BookData[],
      loading: false,
      emergencyThreshold: 5,
    }),

    actions: {
      setEmergencyThreshold(inputValue?: number) {
        this.emergencyThreshold = inputValue ?? 5;
      },

      setBooks(data: BookData[]) {
        this.books = data;
      },

      async loadBooks() {
        this.loading = true;

        try {
          const threshold = this.emergencyThreshold ?? 5;

          const { data } = await getBook(threshold);

          this.setBooks(data);
        } catch (error) {
          console.error(error);
        } finally {
          this.loading = false;
        }
      },
    },

    getters: {
  totalBooks: (state) => state.books.length,

  lowStockBooks: (state) =>
    state.books.filter(
      (book) => book.stock_quantity < state.emergencyThreshold
    ).length,

  totalInventoryValue: (state) =>
    state.books.reduce(
      (total, book) => total + book.price * book.stock_quantity,
      0
    ),

   totalInventory: (state) =>
  state.books.reduce(
    (total, book) => total + book.stock_quantity,
    0
  ),
}
  }
);
