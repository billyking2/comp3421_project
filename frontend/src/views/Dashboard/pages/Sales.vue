<template>
  <section>
    <div>
      <h1>Sales Analytics</h1>
      <p>Sales metrics are based on paid orders.</p>
    </div>

    <el-alert
      v-if="salesStore.error"
      :title="salesStore.error"
      type="error"
      show-icon
      :closable="false"
    />

    <el-row :gutter="16">
      <el-col :xs="24" :sm="8">
        <el-card>
          <el-statistic title="Revenue" :value="summary.revenue" :precision="2">
            <template #prefix>$</template>
          </el-statistic>
        </el-card>
      </el-col>
      <el-col :xs="24" :sm="8">
        <el-card>
          <el-statistic title="Total orders" :value="summary.total_orders" />
        </el-card>
      </el-col>
      <el-col :xs="24" :sm="8">
        <el-card>
          <el-statistic
            title="Average order value"
            :value="summary.average_order_value"
            :precision="2"
          >
            <template #prefix>$</template>
          </el-statistic>
        </el-card>
      </el-col>
    </el-row>

    <el-card v-loading="salesStore.loading">
      <template #header>
        <span>Monthly sales trend (last 12 months)</span>
      </template>
      <Chart :option="monthlySalesOption" height="340px" />
    </el-card>

    <el-card v-loading="salesStore.loading">
      <template #header>
        <span>Best-selling books</span>
      </template>
      <Chart :option="bestSellingOption" height="340px" />
      <el-table :data="bestSellingBooks" row-key="book_id" empty-text="No paid sales yet.">
        <el-table-column prop="title" label="Book" min-width="200" />
        <el-table-column prop="units_sold" label="Units sold" width="130" />
        <el-table-column label="Revenue" width="150">
          <template #default="{ row }: { row: SalesAnalytics['bestSellingBooks'][number] }">
            ${{ row.revenue.toFixed(2) }}
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </section>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue';
import type { EChartsOption } from 'echarts';
import Chart from '../../../components/dashboard/Chart.vue';
import type { SalesAnalytics } from '../../../services/dashboardData';
import { useSalesDataStore } from '../../../store/useSalesDataStore';

const salesStore = useSalesDataStore();

const summary = computed(
  () =>
    salesStore.data?.summary ?? {
      revenue: 0,
      total_orders: 0,
      average_order_value: 0,
    },
);

const monthlySales = computed(() => salesStore.data?.monthlySales ?? []);
const bestSellingBooks = computed(() => salesStore.data?.bestSellingBooks ?? []);

const monthlySalesOption = computed<EChartsOption>(() => ({
  color: ['#8a6347'],
  tooltip: { trigger: 'axis' },
  xAxis: {
    type: 'category',
    boundaryGap: false,
    data: monthlySales.value.map((month) => formatMonth(month.month)),
    axisLabel: { color: '#817366' },
  },
  yAxis: {
    type: 'value',
    name: 'Revenue ($)',
    axisLabel: { color: '#817366' },
  },
  series: [
    {
      name: 'Revenue',
      type: 'line',
      smooth: true,
      data: monthlySales.value.map((month) => month.revenue),
      areaStyle: {},
    },
  ],
}));

const bestSellingOption = computed<EChartsOption>(() => ({
  color: ['#78816a'],
  tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
  grid: { left: 140, right: 24, top: 16, bottom: 24 },
  xAxis: {
    type: 'value',
    name: 'Units sold',
    axisLabel: { color: '#817366' },
  },
  yAxis: {
    type: 'category',
    inverse: true,
    data: bestSellingBooks.value.map((book) => book.title),
    axisLabel: { color: '#665748' },
  },
  series: [
    {
      name: 'Units sold',
      type: 'bar',
      data: bestSellingBooks.value.map((book) => book.units_sold),
    },
  ],
}));

onMounted(() => {
  void salesStore.loadSales();
});

function formatMonth(value: string): string {
  const date = new Date(`${value}-01T00:00:00`);
  return Number.isNaN(date.getTime())
    ? value
    : date.toLocaleDateString(undefined, { month: 'short', year: '2-digit' });
}
</script>
