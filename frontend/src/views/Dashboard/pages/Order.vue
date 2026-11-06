<template>
  <section>
    <div>
      <h1>Orders</h1>
      <p>View customer orders, payment status, and purchased books.</p>
    </div>

    <el-row :gutter="16">
      <el-col :xs="12" :sm="8">
        <el-card>
          <el-statistic title="Total orders" :value="orders.length" />
        </el-card>
      </el-col>
      <el-col :xs="12" :sm="8">
        <el-card>
          <el-statistic title="Paid orders" :value="paidOrders.length" />
        </el-card>
      </el-col>
      <el-col :xs="12" :sm="8">
        <el-card>
          <el-statistic title="Paid revenue" :value="paidRevenue" :precision="2">
            <template #prefix>$</template>
          </el-statistic>
        </el-card>
      </el-col>
    </el-row>

    <el-card>
      <el-form :model="filters" inline @submit.prevent>
        <el-form-item label="Search">
          <el-input
            v-model="filters.query"
            placeholder="Order ID or customer"
            clearable
          />
        </el-form-item>
        <el-form-item label="Payment status">
          <el-select v-model="filters.status">
            <el-option label="All statuses" value="all" />
            <el-option label="Paid" value="paid" />
            <el-option label="Not paid" value="not paid" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button :loading="loading" @click="loadOrders">Refresh</el-button>
        </el-form-item>
      </el-form>

      <el-alert
        v-if="error"
        :title="error"
        type="error"
        show-icon
        :closable="false"
      />

      <el-table
            ref="tableRef"
            v-loading="loading"
            :data="pageOrders"
            row-key="order_id"
            empty-text="No orders match these filters."
            @row-click="handleRowClick"
            >
        <el-table-column type="expand">
          <template #default="{ row }: { row: DashboardOrder }">
            <el-table :data="row.items" size="small">
              <el-table-column prop="title" label="Book" min-width="180" />
              <el-table-column prop="quantity" label="Quantity" width="100" />
              <el-table-column label="Unit price" width="130">
                <template #default="{ row: item }: { row: DashboardOrderItem }">
                  ${{ item.unit_price.toFixed(2) }}
                </template>
              </el-table-column>
            </el-table>
          </template>
        </el-table-column>
        <el-table-column label="Order" width="110">
          <template #default="{ row }: { row: DashboardOrder }">
            #{{ row.order_id }}
          </template>
        </el-table-column>
        <el-table-column prop="customer_name" label="Customer" min-width="150" />
        <el-table-column label="Items" width="90">
          <template #default="{ row }: { row: DashboardOrder }">
            {{ itemCount(row) }}
          </template>
        </el-table-column>
        <el-table-column label="Total" width="120">
          <template #default="{ row }: { row: DashboardOrder }">
            ${{ row.total_amount.toFixed(2) }}
          </template>
        </el-table-column>
        <el-table-column label="Payment" width="120">
          <template #default="{ row }: { row: DashboardOrder }">
            <el-tag :type="row.payment_status === 'paid' ? 'success' : 'warning'">
              {{ row.payment_status === 'paid' ? 'Paid' : 'Not paid' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="Order date" min-width="170">
          <template #default="{ row }: { row: DashboardOrder }">
            {{ formatDate(row.created_at) }}
          </template>
        </el-table-column>
      </el-table>

      <el-pagination
        v-model:current-page="page"
        v-model:page-size="pageSize"
        :page-sizes="[10, 20, 50, 100]"
        :total="filteredOrders.length"
        layout="total, sizes, prev, pager, next, jumper"
        background
        />
    </el-card>
  </section>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref, watch } from 'vue';
import { getOrders, type DashboardOrder, type DashboardOrderItem } from '../../../services/dashboardData';

const tableRef = ref();
const orders = ref<DashboardOrder[]>([]);
const loading = ref(false);
const error = ref('');
const page = ref(1);
const pageSize = ref(20);
const filters = reactive({
  query: '',
  status: 'all' as 'all' | DashboardOrder['payment_status'],
});

const paidOrders = computed(() =>
  orders.value.filter((order) => order.payment_status === 'paid'),
);

const paidRevenue = computed(() =>
  paidOrders.value.reduce((sum, order) => sum + order.total_amount, 0),
);

const filteredOrders = computed(() => {
  const query = filters.query.trim().toLowerCase();

  return orders.value.filter((order) => {
    const matchesQuery =
      !query ||
      String(order.order_id).includes(query) ||
      order.customer_name.toLowerCase().includes(query);
    const matchesStatus =
      filters.status === 'all' || order.payment_status === filters.status;

    return matchesQuery && matchesStatus;
  });
});

const pageOrders = computed(() => {
    const start = (page.value - 1) * pageSize.value;
  return filteredOrders.value.slice(
    start,
    start + pageSize.value,
  );
});

watch(
  () => [filters.query, filters.status],
  () => {
    page.value = 1;
  },
);

watch(
  () => filteredOrders.value.length,
  (count) => {
    const lastPage = Math.max(1,Math.ceil(count / pageSize.value));
    if (page.value > lastPage) page.value = lastPage;
  },
);

onMounted(() => {
  void loadOrders();
});

async function loadOrders(): Promise<void> {
  loading.value = true;
  error.value = '';

  try {
    const { data } = await getOrders();
    orders.value = data;
  } catch (cause) {
    error.value = cause instanceof Error ? cause.message : 'Failed to load orders';
  } finally {
    loading.value = false;
  }
}

function handleRowClick(row: DashboardOrder): void {
  tableRef.value?.toggleRowExpansion(row);
}

function itemCount(order: DashboardOrder): number {
  return order.items.reduce((total, item) => total + item.quantity, 0);
}

function formatDate(value: string): string {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? '—' : date.toLocaleString();
}
</script>
