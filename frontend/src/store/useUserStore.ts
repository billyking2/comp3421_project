import {defineStore} from 'pinia'

export const useUserStore = defineStore('user', {
  state: () => ({
    userId: null as string | null,
    username: null as string | null,
    role: null as string | null,
    initialized: false,
  }),

  actions: {
    setUser(user: {
      userId: string;
      username: string;
      role: string;
    }) {
      this.userId = user.userId;
      this.username = user.username;
      this.role = user.role;
    },

    logout() {
      this.userId = null;
      this.username = null;
      this.role = null;
    },

    setInitialized() {
      this.initialized = true;
    },

  },
});