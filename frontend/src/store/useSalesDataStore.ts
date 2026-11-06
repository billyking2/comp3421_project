import { defineStore } from 'pinia';
import { getSales, type SalesAnalytics } from '../services/dashboardData';

export const useSalesDataStore = defineStore('salesData', {
  state: () => ({
    data: null as SalesAnalytics | null,
    loading: false,
    error: null as string | null,
  }),

  actions: {
    async loadSales() {
      this.loading = true;
      this.error = null;

      try {
        const { data } = await getSales();
        this.data = data;
      } catch (error) {
        this.error =
          error instanceof Error ? error.message : 'Failed to load sales analytics';
      } finally {
        this.loading = false;
      }
    },
  },
});
