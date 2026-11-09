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
      <div class="orders-toolbar">
        <h2>Order list</h2>
        <el-button :loading="loading" @click="loadOrders">Refresh</el-button>
      </div>
      <OrdersTable
        :orders="orders"
        :loading="loading"
        :error="error"
        search-placeholder="Order ID, customer, or book"
        empty-description="No orders found."
        :page-sizes="[10, 20, 50, 100]"
        :initial-page-size="20"
      >
        <template #columns>
          <el-table-column prop="customer_name" label="Customer" min-width="150" />
          <el-table-column label="Items" width="90">
            <template #default="{ row }: { row: DashboardOrder }">
              {{ itemCount(row) }}
            </template>
          </el-table-column>
          <el-table-column label="Total" width="120">
            <template #default="{ row }: { row: DashboardOrder }">
              {{ formatCurrency(row.total_amount) }}
            </template>
          </el-table-column>
        </template>
      </OrdersTable>
    </el-card>
  </section>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { getOrders, type DashboardOrder } from '../../../services/dashboardData';
import OrdersTable from '../../../components/common/OrdersTable.vue';

const orders = ref<DashboardOrder[]>([]);
const loading = ref(false);
const error = ref('');

const paidOrders = computed(() =>
  orders.value.filter((order) => order.payment_status === 'paid'),
);

const paidRevenue = computed(() =>
  paidOrders.value.reduce((sum, order) => sum + order.total_amount, 0),
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

function itemCount(order: DashboardOrder): number {
  return order.items.reduce((total, item) => total + item.quantity, 0);
}

function formatCurrency(value: number): string {
  return `$${value.toFixed(2)}`;
}
</script>

<style scoped>
.orders-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  margin-bottom: 1rem;
}

.orders-toolbar h2 {
  margin: 0;
  font-size: 1.1rem;
}
</style>
