<template>
    <div class="welcome-banner">
    <div class="welcome-copy">
        <span class="eyebrow">
            Book Store Overview
        </span>
        <h1>{{ greeting }},{{ userStore.username }}</h1>
    </div>

    <div class="card-grid">
        <Card label="Today Order" :value=todayDataStore.data?.today.orders??0 unit="Order" :trend=todayDataStore.orderChange??0 icon="Document" />
        <Card label="Today Sales" :value=todayDataStore.data?.today.sales??0 unit="$" :trend=todayDataStore.salesChange??0 icon="Money" tone="blue" />
        <Card label="Today New Member" :value=todayDataStore.data?.today.members??0 unit="Member" :trend=todayDataStore.memberChange??0 icon="User" tone="amber" />
        <Card label="Emergency inventory" :value=todayDataStore.data?.emergencyInventory??0 unit="Books" icon="Box" tone="red" />
    </div>
    
</div>
    

</template>

<script setup lang="ts">
    import Card from "../../../components/dashboard/Card.vue"
    import { useUserStore } from "../../../store/useUserStore";
    import { onMounted } from "vue";
    import { useTodayDataStore } from "../../../store/useTodayDataStore.ts";
    
    const userStore =useUserStore()
    const getHour = new Date().getHours()
    const greeting = getHour < 12 ? "Good morning" : getHour < 18 ? "Good afternoon" : "Good Night"

    const todayDataStore = useTodayDataStore();

    onMounted(async () => {
    await todayDataStore.loadTodayData();
    });

</script>

<style>

</style>