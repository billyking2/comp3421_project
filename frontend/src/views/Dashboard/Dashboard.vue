<template>
  <div class="dashboard-shell">
    <Sidebar />

    <main
      class="main"
      :class="{ wide: dashboardStore.collapsed }"
    >
      <Header />

      <component
        :is="currentComponent"
      />
    </main>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import Sidebar from '../../components/dashboard/sidebar.vue';
import Header from '../../components/dashboard/header.vue'

import DashboardHome from './pages/Home.vue'
import Sales from './pages/Sales.vue'
import Inventory from './pages/Inventory.vue'
import Order from './pages/Order.vue'
import Member from './pages/Member.vue'

import { useDashboardStore } from '../../store/useDashboardStore.ts'

const dashboardStore =
  useDashboardStore()

const pageMap = {
  home: DashboardHome,
  sales: Sales,
  inventory: Inventory,
  order: Order,
  member: Member,
}

const currentComponent = computed(
  () =>
    pageMap[
      dashboardStore.activeMenu as keyof typeof pageMap
    ]
)

</script>

<style scoped>

</style>