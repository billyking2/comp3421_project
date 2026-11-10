<template>
  <main class="my-orders-page">
    <div class="orders-content">


      <el-card class="orders-card" shadow="never">
        <div class="orders-toolbar">
          <div class="toolbar-heading">
            <h2>Order history</h2>
          </div>
          <el-button :loading="loading" @click="loadOrders">Refresh</el-button>
        </div>
        <OrdersTable
          :orders="orders"
          :loading="loading"
          :error="error"
          search-placeholder="Order number or book title"
          empty-description="You haven't placed an order yet."
          order-prefix="Order "
          :page-sizes="[5, 10, 20]"
          :initial-page-size="5"
        >
          <template #empty-action>
            <el-button type="primary" @click="goToBooks">Browse books</el-button>
          </template>
          <template #payment-actions="{ order }">
            <el-button
              v-if="order.payment_status === 'not paid'"
              class="mark-paid-button"
              type="primary"
              size="small"
              :loading="updatingOrderId === order.order_id"
              :disabled="updatingOrderId !== null"
              @click.stop="openPaymentDialog(order)"
            >
              Mark as paid
            </el-button>
          </template>
        </OrdersTable>

        <el-dialog
          v-model="paymentDialogVisible"
          title="Confirm payment status"
          width="min(92vw, 440px)"
          :close-on-click-modal="false"
          :before-close="handlePaymentDialogClose"
          @closed="selectedOrder = null"
        >
          <p v-if="selectedOrder" class="payment-confirmation">
            Confirm that you have completed payment for order
            <strong>{{ selectedOrder.order_id }}</strong>
            totaling
            <strong>{{ formatCurrency(selectedOrder.total_amount) }}</strong>.
          </p>
          <template #footer>
            <div class="dialog-footer">
              <el-button :disabled="updatingOrderId !== null" @click="paymentDialogVisible = false">
                Cancel
              </el-button>
              <el-button
                type="primary"
                :loading="updatingOrderId !== null"
                :disabled="!selectedOrder"
                @click="submitPaymentConfirmation"
              >
                Confirm paid
              </el-button>
            </div>
          </template>
        </el-dialog>

      </el-card>
    </div>
  </main>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import { changeMyOrders, getMyOrders, type DashboardOrder } from '../../services/Data.ts';
import { ElMessage } from 'element-plus';
import OrdersTable from '../../components/common/OrdersTable.vue';

const router = useRouter();
const orders = ref<DashboardOrder[]>([]);
const loading = ref(false);
const error = ref('');
const updatingOrderId = ref<number | null>(null);
const paymentDialogVisible = ref(false);
const selectedOrder = ref<DashboardOrder | null>(null);

onMounted(() => {
  void loadOrders();
});

async function loadOrders(): Promise<void> {
  loading.value = true;
  error.value = '';

  try {
    const { data } = await getMyOrders();
    orders.value = data;
  } catch (cause) {
    error.value = cause instanceof Error ? cause.message : 'Failed to load your orders';
  } finally {
    loading.value = false;
  }
}

function openPaymentDialog(order: DashboardOrder): void {
  selectedOrder.value = order;
  paymentDialogVisible.value = true;
}

function handlePaymentDialogClose(done: () => void): void {
  if (updatingOrderId.value === null) done();
}

async function submitPaymentConfirmation(): Promise<void> {
  const order = selectedOrder.value;
  if (!order) return;

  updatingOrderId.value = order.order_id;
  try {
    await changeMyOrders(order.order_id);
    order.payment_status = 'paid';
    ElMessage.success(`Order ${order.order_id} marked as paid.`);
    paymentDialogVisible.value = false;
  } catch (cause) {
    ElMessage.error(cause instanceof Error ? cause.message : 'Failed to update payment status.');
  } finally {
    updatingOrderId.value = null;
  }
}

function goToBooks(): void {
  void router.push('/book');
}

function formatCurrency(value: number): string {
  return `$${value.toFixed(2)}`;
}

</script>

<style scoped>
.my-orders-page {
  min-height: 65vh;
  padding: 3rem 1.5rem 4rem;
  background: #f9f6f0;
  color: #29251f;
}

.orders-content {
  width: min(100%, 1280px);
  margin: 0 auto;
}

.orders-card {
  width: 100%;
  min-height: 460px;
  border-color: #e8dfd3;
  background: #fffdfa;
}

.orders-card :deep(.el-card__body) {
  padding: 24px;
}

.orders-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  margin-bottom: 0.75rem;
}

.toolbar-heading h2 {
  margin: 0;
  font-size: 1.2rem;
}

.payment-confirmation {
  margin: 0;
  line-height: 1.6;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 0.5rem;
}

@media (max-width: 600px) {
  .my-orders-page {
    padding: 2rem 1rem 3rem;
  }

  .orders-card :deep(.el-card__body) {
    padding: 12px;
  }

  .orders-toolbar {
    align-items: flex-start;
    flex-wrap: wrap;
  }

  .mark-paid-button {
    padding: 6px 8px;
  }
}
</style>
