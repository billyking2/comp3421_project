import { defineStore } from "pinia";
import { getToday } from "../services/getTodayData";

export interface TodayData {
  today: {
    orders: number;
    sales: number;
    members: number;
  };

  yesterday: {
    orders: number;
    sales: number;
    members: number;
  };

  emergencyInventory: number;
}

export const useTodayDataStore = defineStore("todayData", {
  state: () => ({
    data: null as TodayData | null,
    loading: false,
    emergencyThreshold: 5,
  }),

  actions: {
    setEmergencyThreshold(inputValue?: number) {
      this.emergencyThreshold = inputValue ?? 5;
    },

    setTodayData(data: TodayData) {
      this.data = data;
    },

    async loadTodayData() {
      this.loading = true;

      try {
        const threshold = this.emergencyThreshold ?? 5;
        const { data } = await getToday(threshold);

        this.setTodayData(data);
      } catch (error) {
        console.error(error);
      } finally {
        this.loading = false;
      }
    },
  },
  getters: {
    orderChange: (state) =>
      state.data ? state.data.today.orders - state.data.yesterday.orders : 0,

    salesChange: (state) =>
      state.data ? state.data.today.sales - state.data.yesterday.sales : 0,

    memberChange: (state) =>
      state.data ? state.data.today.members - state.data.yesterday.members : 0,

    inventorySituation: (state) => {
      if (!state.data) return "unknown";

      const inventory = state.data.emergencyInventory;
      const threshold = state.emergencyThreshold;

      if (inventory <= 0){
        return "safe";
      }
      if (inventory < threshold * 0.5) {
        return "little";
      }

      if (inventory < threshold) {
        return "middle";
      }
      return "serious";
    },
  },
});
