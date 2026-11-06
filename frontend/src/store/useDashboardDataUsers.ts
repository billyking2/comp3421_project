import { defineStore } from 'pinia';
import { getUsers, type DashboardUser } from '../services/dashboardData';

export type UsersData = DashboardUser;

export const useDashboardDataUsers = defineStore('dashboardDataUsers', {
  state: () => ({
    users: [] as UsersData[],
    loading: false,
    error: null as string | null,
  }),

  actions: {
    async loadUsers() {
      this.loading = true;
      this.error = null;

      try {
        const { data } = await getUsers();
        this.users = data;
      } catch (error) {
        this.error =
          error instanceof Error ? error.message : 'Failed to load members';
      } finally {
        this.loading = false;
      }
    },
  },
});
