<template>
     <aside class="sidebar" :class="{ collapsed: dashboardStore.collapsed , 'mobile-open':mobileOpen }">
    <div class="brand">
        <div class="logo"><RouterLink to="/"><p>gay</p></RouterLink></div>
        <div v-if="!dashboardStore.collapsed" class="description"></div>
    </div>
    <nav>
        <button v-for="item in menus" :key="item.key" :class="{active: dashboardStore.activeMenu === item.key }" @click="handleMenuClick(item.key)">
            <el-icon><component :is="item.icon"></component></el-icon>
            <span v-if="!dashboardStore.collapsed" >{{ item.label }}</span>
        </button>
    </nav>    
    <button class="collapse-btn" @click="handleCollapsed">
        <el-icon><DArrowLeft v-if="!dashboardStore.collapsed"/><DArrowRight v-else/></el-icon>
    </button>
    </aside>
</template>

<script setup lang="ts">
import { DArrowLeft } from '@element-plus/icons-vue';
import { ref,onMounted,computed } from 'vue';
import { useDashboardStore } from '../../store/useDashboardStore'

const mobileOpen = ref(false)

const menus = [
    {key:"home",label:"Home", icon:"House"},
    {key:"sales",label:"Sales", icon:"Money"},
     {key:"inventory",label:"Inventory", icon:"Box"},
      {key:"order",label:"Order", icon:"List"},
       {key:"member",label:"Member", icon:"User"},
       
]

const dashboardStore =
  useDashboardStore()

  const handleCollapsed = () => {
  dashboardStore.toggleCollapsed()
}

const handleMenuClick = (
  key: string,
) => {
  dashboardStore.setActiveMenu(key)
}

</script>

<style>
</style>