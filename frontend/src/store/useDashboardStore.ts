import { defineStore } from 'pinia'

export const useDashboardStore = defineStore(
  'dashboard',
  {
    state: () => ({
      activeMenu: 'home',
      collapsed: false,
    }),

    actions: {
      setActiveMenu(menu: string) {
        this.activeMenu = menu
      },


      toggleCollapsed() {
        this.collapsed = !this.collapsed
      },

      setCollapsed(value: boolean) {
        this.collapsed = value
      },
    },
    getters: {
  label: (state) => {
    const labels: Record<string, string> = {
      home: 'Home',
      sales: 'Sales',
      inventory: 'Inventory',
      order: 'Order',
      member: 'Member',
    }

    return labels[state.activeMenu]
  }
}

  }
)