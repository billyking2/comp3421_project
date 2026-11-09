<template>
  <section class="messages-page">
    <div class="page-heading">
      <div>
        <h1>Messages</h1>
        <p>Read and manage messages sent through the contact form.</p>
      </div>
      <el-tag type="warning" effect="light">{{ unreadCount }} unread</el-tag>
    </div>

    <el-card shadow="never">
      <el-form :model="filters" inline @submit.prevent>
        <el-form-item label="Search">
          <el-input
            v-model="filters.query"
            placeholder="Name, email, or message"
            clearable
          />
        </el-form-item>
        <el-form-item label="Status">
          <el-select v-model="filters.status">
            <el-option label="All messages" value="all" />
            <el-option label="Unread" value="unread" />
            <el-option label="Read" value="read" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" :loading="loading" @click="loadMessages">
            Refresh
          </el-button>
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
        v-loading="loading"
        :data="filteredMessages"
        row-key="id"
        empty-text="No messages match these filters."
      >
        <el-table-column type="expand">
          <template #default="{ row }: { row: ContactMessage }">
            <p class="message-body">{{ row.message }}</p>
          </template>
        </el-table-column>
        <el-table-column label="Status" width="115">
          <template #default="{ row }: { row: ContactMessage }">
            <el-tag :type="row.read ? 'info' : 'warning'" effect="light">
              {{ row.read ? 'Read' : 'Unread' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="name" label="Name" min-width="140" />
        <el-table-column label="Email" min-width="190">
          <template #default="{ row }: { row: ContactMessage }">
            <a class="message-email" :href="`mailto:${row.email}`">{{ row.email }}</a>
          </template>
        </el-table-column>
        <el-table-column
          prop="message"
          label="Message"
          min-width="220"
          show-overflow-tooltip
        />
        <el-table-column label="Received" min-width="170">
          <template #default="{ row }: { row: ContactMessage }">
            {{ formatDate(row.created_at) }}
          </template>
        </el-table-column>
        <el-table-column label="Actions" width="180" fixed="right">
          <template #default="{ row }: { row: ContactMessage }">
            <el-button
              v-if="!row.read"
              size="small"
              @click="markAsRead(row)"
            >
              Mark read
            </el-button>
            <el-button
              type="danger"
              size="small"
              plain
              @click="openDeleteDialog(row)"
            >
              Delete
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <el-dialog
      v-model="deleteDialogVisible"
      title="Delete contact message"
      width="min(440px, calc(100% - 32px))"
      :close-on-click-modal="!deleting"
      :close-on-press-escape="!deleting"
      :show-close="!deleting"
    >
      <p v-if="messageToDelete" class="delete-confirmation">
        Are you sure you want to delete the message from
        <strong>{{ messageToDelete.name }}</strong>? This action cannot be undone.
      </p>
      <template #footer>
        <el-button :disabled="deleting" @click="deleteDialogVisible = false">
          Cancel
        </el-button>
        <el-button type="danger" :loading="deleting" @click="confirmDelete">
          Delete message
        </el-button>
      </template>
    </el-dialog>
  </section>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue';
import { ElMessage } from 'element-plus';
import {
  deleteContactMessage,
  getContactMessages,
  markContactMessageRead,
  type ContactMessage,
} from '../../../services/Data';
import { getErrorMessage } from '../../../utils/authStatus';

const messages = ref<ContactMessage[]>([]);
const loading = ref(false);
const error = ref('');
const filters = reactive({
  query: '',
  status: 'all' as 'all' | 'unread' | 'read',
});
const deleteDialogVisible = ref(false);
const deleting = ref(false);
const messageToDelete = ref<ContactMessage | null>(null);

const unreadCount = computed(() => messages.value.filter((message) => !message.read).length);

const filteredMessages = computed(() => {
  const query = filters.query.trim().toLowerCase();

  return messages.value.filter((message) => {
    const matchesQuery =
      !query ||
      message.name.toLowerCase().includes(query) ||
      message.email.toLowerCase().includes(query) ||
      message.message.toLowerCase().includes(query);
    const matchesStatus =
      filters.status === 'all' ||
      (filters.status === 'read' && message.read) ||
      (filters.status === 'unread' && !message.read);

    return matchesQuery && matchesStatus;
  });
});

onMounted(() => {
  void loadMessages();
});

async function loadMessages(): Promise<void> {
  loading.value = true;
  error.value = '';

  try {
    const { data } = await getContactMessages();
    messages.value = data;
  } catch (cause) {
    error.value = getErrorMessage(cause);
  } finally {
    loading.value = false;
  }
}

async function markAsRead(message: ContactMessage): Promise<void> {
  try {
    await markContactMessageRead(message.id);
    message.read = true;
    ElMessage.success('Message marked as read');
  } catch (cause) {
    ElMessage.error(getErrorMessage(cause));
  }
}

function openDeleteDialog(message: ContactMessage): void {
  messageToDelete.value = message;
  deleteDialogVisible.value = true;
}

async function confirmDelete(): Promise<void> {
  const message = messageToDelete.value;
  if (!message || deleting.value) return;

  deleting.value = true;
  try {
    await deleteContactMessage(message.id);
    messages.value = messages.value.filter((item) => item.id !== message.id);
    deleteDialogVisible.value = false;
    messageToDelete.value = null;
    ElMessage.success('Contact message deleted');
  } catch (cause) {
    ElMessage.error(getErrorMessage(cause));
  } finally {
    deleting.value = false;
  }
}

function formatDate(value: string): string {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? '—' : date.toLocaleString();
}
</script>

<style scoped>
.messages-page {
  display: grid;
  gap: 20px;
}

.page-heading {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
}

.page-heading p {
  margin: 8px 0 0;
}

.message-body {
  margin: 0;
  padding: 8px 24px;
  color: var(--dash-ink);
  white-space: pre-wrap;
  overflow-wrap: anywhere;
}

.message-email {
  color: var(--dash-brown-dark);
}

.delete-confirmation {
  color: var(--dash-ink);
  line-height: 1.7;
}
</style>
