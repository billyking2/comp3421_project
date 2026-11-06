<template>
    <div class="welcome-banner">
    <div class="welcome-copy">
        <span class="eyebrow">
            Book Store Overview
        </span>
        <h1>{{ greeting }} , {{ userStore.username }}</h1>
    </div>

    <div class="card-grid">
        <Card label="Today Order" :value=todayDataStore.data?.today.orders??0 unit="Order" :trend=todayDataStore.orderChange??0 icon="Document" />
        <Card label="Today Sales" :value=todayDataStore.data?.today.sales??0 unit="$" :trend=todayDataStore.salesChange??0 icon="Money" tone="blue" />
        <Card label="Today New Member" :value=todayDataStore.data?.today.members??0 unit="Member" :trend=todayDataStore.memberChange??0 icon="User" tone="amber" />
        <Card label="Emergency inventory" :value=todayDataStore.data?.emergencyInventory??0 unit="Books" icon="Box" tone="red" />
    </div>

    <el-alert
        v-if="salesStore.error"
        :title="salesStore.error"
        type="error"
        show-icon
        :closable="false"
    />

    <el-row :gutter="16" v-loading="salesStore.loading">
        <el-col :xs="24" :lg="14">
            <el-card>
                <template #header>Monthly sales and order trend</template>
                <Chart :option="monthlySalesOption" height="320px" />
            </el-card>
        </el-col>
        <el-col :xs="24" :lg="10">
            <el-card>
                <template #header>Top-selling books</template>
                <Chart :option="bestSellingOption" height="320px" />
            </el-card>
        </el-col>
    </el-row>
</div>
    

</template>

<script setup lang="ts">
    import Card from "../../../components/dashboard/Card.vue"
    import { useUserStore } from "../../../store/useUserStore";
    import { computed, onMounted } from "vue";
    import type { EChartsOption } from "echarts";
    import { useTodayDataStore } from "../../../store/useTodayDataStore.ts";
    import { useSalesDataStore } from "../../../store/useSalesDataStore";
    import Chart from "../../../components/dashboard/Chart.vue";
    
    const userStore =useUserStore()
    const getHour = new Date().getHours()
    const greeting = getHour < 12 ? "Good morning" : getHour < 18 ? "Good afternoon" : "Good Night"

    const todayDataStore = useTodayDataStore();
    const salesStore = useSalesDataStore();
    const monthlySales = computed(() => salesStore.data?.monthlySales ?? []);
    const bestSellingBooks = computed(() => salesStore.data?.bestSellingBooks.slice(0, 5) ?? []);

    const monthlySalesOption = computed<EChartsOption>(() => ({
        color: ["#8a6347", "#78816a", "#ad715a", "#748a91"],
        tooltip: { trigger: "axis" },
        legend: { data: ["Revenue", "Orders"] },
        xAxis: {
            type: "category",
            data: monthlySales.value.map(({ month }) => formatMonth(month)),
        },
        yAxis: [
            { type: "value", name: "Revenue ($)", axisLabel: { color: "#817366" } },
            { type: "value", name: "Orders", minInterval: 1, axisLabel: { color: "#817366" } },
        ],
        series: [
            {
                name: "Revenue",
                type: "line",
                smooth: true,
                data: monthlySales.value.map(({ revenue }) => revenue),
            },
            {
                name: "Orders",
                type: "bar",
                yAxisIndex: 1,
                data: monthlySales.value.map(({ order_count }) => order_count),
            },
        ],
    }));

    const bestSellingOption = computed<EChartsOption>(() => ({
        color: ["#8a6347"],
        tooltip: { trigger: "axis", axisPointer: { type: "shadow" } },
        grid: { left: 120, right: 20, top: 16, bottom: 24 },
        xAxis: { type: "value", name: "Units sold", axisLabel: { color: "#817366" } },
        yAxis: {
            type: "category",
            inverse: true,
            data: bestSellingBooks.value.map(({ title }) => title),
            axisLabel: { color: "#665748" },
        },
        series: [
            {
                name: "Units sold",
                type: "bar",
                data: bestSellingBooks.value.map(({ units_sold }) => units_sold),
            },
        ],
    }));

    onMounted(async () => {
    await todayDataStore.loadTodayData();
    if (!salesStore.data) {
        await salesStore.loadSales();
    }
    });

    function formatMonth(value: string): string {
        const date = new Date(`${value}-01T00:00:00`);
        return Number.isNaN(date.getTime())
            ? value
            : date.toLocaleDateString(undefined, { month: "short", year: "2-digit" });
    }

</script>

<style>

</style>