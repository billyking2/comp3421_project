<template>
  <div class="orders-table-content">
    <el-form class="orders-filters" :model="filters" inline @submit.prevent>
      <el-form-item>
        <el-input
          v-model="filters.query"
          clearable
          :placeholder="searchPlaceholder"
          aria-label="Search orders"
        />
      </el-form-item>
      <el-form-item>
        <el-select v-model="filters.status" aria-label="Filter by payment status">
          <el-option label="All payment statuses" value="all" />
          <el-option label="Paid" value="paid" />
          <el-option label="Not paid" value="not paid" />
        </el-select>
      </el-form-item>
    </el-form>

    <el-alert
      v-if="error"
      class="orders-error"
      :title="error"
      type="error"
      show-icon
      :closable="false"
    />

    <div v-if="loading && orders.length === 0" class="loading-state">
      <el-skeleton :rows="5" animated />
    </div>
    <el-empty
      v-else-if="orders.length === 0 && !error"
      :description="emptyDescription"
    >
      <slot name="empty-action" />
    </el-empty>
    <el-empty
      v-else-if="filteredOrders.length === 0 && !error"
      description="No orders match these filters."
    />
    <el-table
      v-else
      ref="tableRef"
      v-loading="loading"
      class="orders-table"
      :data="pageOrders"
      row-key="order_id"
      table-layout="fixed"
      empty-text="No orders to display."
      @row-click="handleRowClick"
    >
      <el-table-column type="expand" width="32">
        <template #default="{ row }: { row: DashboardOrder }">
          <div class="expanded-order">
            <el-table
              :data="row.items"
              class="order-items-table"
              table-layout="fixed"
              empty-text="No item details available."
            >
              <el-table-column prop="title" label="Book" min-width="100" />
              <el-table-column label="Quantity" width="90" align="center">
                <template #default="{ row: item }: { row: DashboardOrderItem }">
                  {{ item.quantity }}
                </template>
              </el-table-column>
              <el-table-column label="Subtotal" width="100" align="right">
                <template #default="{ row: item }: { row: DashboardOrderItem }">
                  {{ formatCurrency(item.unit_price * item.quantity) }}
                </template>
              </el-table-column>
            </el-table>
            <div class="expanded-order-total">
              <span>{{ itemCount(row) }} {{ itemCount(row) === 1 ? 'item' : 'items' }}</span>
              <span>Total <strong>{{ formatCurrency(row.total_amount) }}</strong></span>
            </div>
          </div>
        </template>
      </el-table-column>
      <el-table-column :label="orderColumnLabel" min-width="130">
        <template #default="{ row }: { row: DashboardOrder }">
          <p class="order-number">{{ orderPrefix }}{{ row.order_id }}</p>
          <p class="order-date">{{ formatDate(row.created_at) }}</p>
        </template>
      </el-table-column>
      <slot name="columns" />
      <el-table-column label="Payment" min-width="120">
        <template #default="{ row }: { row: DashboardOrder }">
          <div class="payment-cell">
            <el-tag :type="row.payment_status === 'paid' ? 'success' : 'warning'" effect="light">
              {{ row.payment_status === 'paid' ? 'Paid' : 'Not paid' }}
            </el-tag>
            <slot name="payment-actions" :order="row" />
          </div>
        </template>
      </el-table-column>
    </el-table>

    <el-pagination
      v-if="filteredOrders.length > 0"
      v-model:current-page="page"
      v-model:page-size="pageSize"
      class="orders-pagination"
      :page-sizes="pageSizes"
      :total="filteredOrders.length"
      layout="total, sizes, prev, pager, next"
      background
    />
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import type { DashboardOrder, DashboardOrderItem } from '../../services/Data';

interface Props {
  orders: DashboardOrder[];
  loading: boolean;
  error: string;
  searchPlaceholder?: string;
  emptyDescription?: string;
  orderPrefix?: string;
  orderColumnLabel?: string;
  pageSizes?: number[];
  initialPageSize?: number;
}

const props = withDefaults(defineProps<Props>(), {
  searchPlaceholder: 'Order number, customer, or book',
  emptyDescription: 'No orders found.',
  orderPrefix: '#',
  orderColumnLabel: 'Order',
  pageSizes: () => [10, 20, 50, 100],
  initialPageSize: 20,
});

const tableRef = ref<{ toggleRowExpansion: (row: DashboardOrder) => void } | null>(null);
const page = ref(1);
const pageSize = ref(props.initialPageSize);
const filters = ref({
  query: '',
  status: 'all' as 'all' | DashboardOrder['payment_status'],
});

const filteredOrders = computed(() => {
  const query = filters.value.query.trim().toLowerCase();

  return props.orders.filter((order) => {
    const matchesQuery =
      !query ||
      String(order.order_id).includes(query) ||
      order.customer_name.toLowerCase().includes(query) ||
      order.items.some((item) => item.title.toLowerCase().includes(query));
    const matchesStatus =
      filters.value.status === 'all' || order.payment_status === filters.value.status;

    return matchesQuery && matchesStatus;
  });
});

const pageOrders = computed(() => {
  const start = (page.value - 1) * pageSize.value;
  return filteredOrders.value.slice(start, start + pageSize.value);
});

watch(
  () => [filters.value.query, filters.value.status],
  () => {
    page.value = 1;
  },
);

watch(
  () => [filteredOrders.value.length, pageSize.value],
  ([count, size]) => {
    page.value = Math.min(page.value, Math.max(1, Math.ceil(count / size)));
  },
);

function handleRowClick(row: DashboardOrder): void {
  tableRef.value?.toggleRowExpansion(row);
}

function itemCount(order: DashboardOrder): number {
  return order.items.reduce((total, item) => total + item.quantity, 0);
}

function formatCurrency(value: number): string {
  return `$${value.toFixed(2)}`;
}

function formatDate(value: string): string {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? '—' : date.toLocaleString();
}
</script>

<style scoped>
.orders-filters {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
  margin-bottom: 0.75rem;
}

.orders-filters :deep(.el-form-item) {
  margin-bottom: 0.25rem;
}

.orders-filters :deep(.el-input) {
  width: min(100%, 360px);
}

.orders-filters :deep(.el-select) {
  width: 220px;
}

.orders-error {
  margin: 0.75rem 0 1rem;
}

.loading-state {
  padding: 1.5rem 0;
}

.orders-table {
  width: 100%;
  margin-top: 0.5rem;
}

.orders-table :deep(.el-table__body td:nth-child(2) .cell),
.orders-table :deep(.el-table__header th:nth-child(2) .cell) {
  padding-left: 4px;
}

.order-number {
  margin: 0;
  font-weight: 650;
}

.order-date {
  margin: 0.25rem 0 0;
  color: #71695f;
  font-size: 0.85rem;
}

.expanded-order {
  padding: 0.5rem 1rem 0.75rem;
}

.order-items-table {
  width: 100%;
}

.expanded-order-total {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  padding: 0.75rem 0.85rem 0;
  color: #71695f;
}

.payment-cell {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.5rem;
}

.orders-pagination {
  justify-content: center;
  margin-top: 1.5rem;
}

@media (max-width: 600px) {
  .orders-filters {
    flex-direction: column;
    gap: 0;
    width: 100%;
  }

  .orders-filters :deep(.el-input),
  .orders-filters :deep(.el-select) {
    width: 100%;
  }

  .expanded-order {
    padding: 0.4rem 0;
  }

  .expanded-order-total {
    padding-right: 0.25rem;
    padding-left: 0.25rem;
  }

  .orders-table :deep(.el-table__body td:nth-child(2) .cell),
  .orders-table :deep(.el-table__header th:nth-child(2) .cell) {
    padding-left: 2px;
  }
}
</style>
