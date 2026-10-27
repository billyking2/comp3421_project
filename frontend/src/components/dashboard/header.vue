<template>
    <header class="topbar">
        <div class="breadcrumb">
            <span>DashBoard</span><i>/</i><b>{{dashboardStore.label}}</b>
        </div>
        <div class="top-actions">
            <button class="icon-btn" @click="handle_color_themes"><el-icon><Sunny /></el-icon></button>
            <p>{{ currentDayName }} , {{ currentDay }}</p>
        </div>
    </header>
    </template>

    <script setup lang="ts">
    import { useDashboardStore } from '../../store/useDashboardStore'
    
const dashboardStore =
  useDashboardStore()

    const weekDays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const currentDayName = weekDays[new Date().getDay()]; 
    const currentDay = new Date().toLocaleDateString();


    function handle_color_themes(){
        
    }
</script>

<style scoped>

</style>