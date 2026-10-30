<template>
  <div class="inventory-page">
    <el-row
      :gutter="20"
      class="summary-row"
    >
      <el-col :span="8">
        <el-card shadow="hover">
          <div class="summary-title">
            Total Inventory
          </div>

          <div class="summary-value">
            {{ bookStore.totalInventory }}
          </div>
        </el-card>
      </el-col>

      <el-col :span="8">
        <el-card shadow="hover">
          <div class="summary-title">
            Low Stock Books (&lt; {{ bookStore.emergencyThreshold }})
          </div>
          <div class="summary-value danger">
            {{ bookStore.lowStockBooks }}
          </div>
        </el-card>
      </el-col>

      <el-col :span="8">
        <el-card shadow="hover">
          <div class="summary-title">
            Inventory Value
          </div>

          <div class="summary-value">
            ${{ bookStore.totalInventoryValue.toFixed(2) }}
          </div>
        </el-card>
      </el-col>
    </el-row>

    <el-card
      shadow="never"
      class="inventory-toolbar"
    >
      <el-input
        v-model="search"
        class="inventory-search"
        placeholder="Search by title..."
        aria-label="Search books by title"
        clearable
      />
      <div class="threshold-control">
        <div class="threshold-description">
          <label for="emergency-threshold">Low-stock threshold</label>
        </div>
        <el-input-number
          id="emergency-threshold"
          v-model="EmergencyThreshold"
          :min="0"
          :precision="0"
          controls-position="right"
          aria-label="Low-stock threshold"
          @keyup.enter="setEmergencyThreshold"
        />
        <el-button
          type="primary"
          @click="setEmergencyThreshold"
        >
          Apply
        </el-button>
      </div>
    </el-card>

    <el-table
      v-loading="bookStore.loading"
      :data="filteredBooks"
      :row-class-name="tableRowClassName"
      border
      style="width: 100%"
    >
      <el-table-column
        label="Photo"
        width="120"
      >
        <template #default="{ row }">
          <el-image
            :src="row.image_url"
            style="width:70px;height:90px"
            fit="cover"
          />
        </template>
      </el-table-column>

      <el-table-column
        prop="title"
        label="Title"
        show-overflow-tooltip
      />

      <el-table-column
        prop="author"
        label="Author"
        show-overflow-tooltip
      />

      <el-table-column
        label="Price"
        width="180"
      >
        <template #default="{ row }">
          <el-input-number
            v-model="row.price"
            :min="0"
            :precision="2"
            controls-position="right"
          />
        </template>
      </el-table-column>

      <el-table-column
        label="Stock"
        width="180"
      >
        <template #default="{ row }">
          <el-input-number
            v-model="row.stock_quantity"
            :min="0"
            controls-position="right"
          />
        </template>
      </el-table-column>

      <el-table-column
        prop="categories"
        label="Categories"
        show-overflow-tooltip
        :filters="categoryFilters"
        :filter-method="filterCategory"
      />

      <el-table-column
  label="Status"
  width="120"
  :filters="[
    { text: 'Low', value: 'low' },
    { text: 'Normal', value: 'normal' }
  ]"
  :filter-method="filterStatus"
>
  <template #default="{ row }">
    <el-tag
      :type="
        row.stock_quantity < bookStore.emergencyThreshold
          ? 'danger'
          : 'success'
      "
    >
      {{
        row.stock_quantity < bookStore.emergencyThreshold
          ? 'Low'
          : 'Normal'
      }}
    </el-tag>
  </template>
</el-table-column>

      <el-table-column
        label="Action"
        width="120"
        fixed="right"
      >
        <template #default="{ row }">
          <el-button
            type="primary"
            size="small"
            @click="saveBook(row)"
          >
            Save
          </el-button>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { ElMessage } from 'element-plus';
import api from '../../../services/api';
import { useDashboardDataBookStore } from '../../../store/useDashboardDataBookStore';
import { useTodayDataStore } from '../../../store/useTodayDataStore';

const bookStore = useDashboardDataBookStore();
const EmergencyThreshold= ref(bookStore.emergencyThreshold);
const search = ref('');
const todayDataStore = useTodayDataStore();

onMounted(async () => {
  await bookStore.loadBooks();
});

const filteredBooks = computed(() => {
  return bookStore.books.filter((book) =>
    book.title.toLowerCase().includes(
      search.value.toLowerCase()
    )
  );
});

const categoryFilters = [
  { text: 'Chinese', value: 'Chinese' },
  { text: 'English', value: 'English' },
  { text: 'Children', value: 'Children' }
];

function filterCategory(
  value: string,
  row: any
) {
  return row.categories?.includes(value);
}


function filterStatus(
  value: string,
  row: any
) {
  const isLow =
    row.stock_quantity <
    bookStore.emergencyThreshold;

  if (value === 'low') {
    return isLow;
  }

  return !isLow;
}

function tableRowClassName({
  row,
}: {
  row: any;
}) {
  if (
    row.stock_quantity <
    bookStore.emergencyThreshold
  ) {
    return 'danger-row';
  }

  return '';
}

function setEmergencyThreshold(){
  bookStore.setEmergencyThreshold(EmergencyThreshold.value);
  todayDataStore.setEmergencyThreshold(EmergencyThreshold.value);
}

async function saveBook(row: {
  book_id: number;
  price: number;
  stock_quantity: number;
}) {
  try {
    await api.put(
      `/api/books/${row.book_id}`,
      {
        price: row.price,
        stock_quantity: row.stock_quantity,
      }
    );

    ElMessage.success(
      'Book updated successfully'
    );
  } catch (error) {
    console.error(error);

    ElMessage.error(
      'Failed to update book'
    );
  }
}
</script>

<style scoped>
.inventory-page {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.summary-row {
  margin-bottom: 10px;
}

.inventory-toolbar :deep(.el-card__body) {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
}

.inventory-search {
  max-width: 360px;
}

.threshold-control {
  display: flex;
  align-items: center;
  gap: 12px;
}

.threshold-description {
  display: flex;
  flex-direction: column;
  line-height: 1.4;
}

.threshold-description label {
  font-weight: 600;
}

.threshold-description span {
  color: #909399;
  font-size: 12px;
}

.summary-title {
  font-size: 14px;
  color: #909399;
}

.summary-value {
  margin-top: 10px;
  font-size: 32px;
  font-weight: bold;
}

.danger {
  color: #f56c6c;
}

@media (max-width: 768px) {
  .inventory-toolbar :deep(.el-card__body),
  .threshold-control {
    align-items: stretch;
    flex-direction: column;
  }

  .inventory-search {
    max-width: none;
  }
}

:deep(.danger-row) {
  --el-table-tr-bg-color: #fef0f0;
}
</style>