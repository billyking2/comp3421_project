<template>
  <main class="book-detail-page">

    <RouterLink class="back-link" to="/book" aria-label="Back to all books">
      <el-icon class="back-icon" aria-hidden="true"><ArrowLeft /></el-icon>
      <span>Back</span>
    </RouterLink>

    <div v-if="error" class="detail-error" role="alert">
      <p>{{ error }}</p>
      <button type="button" @click="loadBooks">Try again</button>
    </div>

    <section v-loading="loading" class="detail-content">
      <div v-if="book" class="product-overview">
        <div class="product-cover">
          <img
            v-if="book.image_url && !imageBroken"
            :src="book.image_url"
            :alt="`Cover of ${book.title}`"
            @error="imageBroken = true"
          />
          <div v-else class="cover-fallback">
            <strong>{{ book.title }}</strong>
            <small>{{ book.author }}</small>
          </div>
        </div>

        <DetailInfo :book="book" @add-to-cart="addBookToCart" />
      </div>
      <p v-else-if="!loading && !error" class="empty-state">
        This book could not be found in the catalog.
      </p>
    </section>

  </main>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import axios from 'axios';
import { ElMessage } from 'element-plus';
import { ArrowLeft } from '@element-plus/icons-vue';
import { RouterLink, useRoute } from 'vue-router';
import DetailInfo from '../../components/store/DetailInfo.vue';
import { getBook, type BookData } from '../../services/Data';
import {
  addCartItem,
  addGuestCartItem,
  getGuestCart,
  saveGuestCart,
} from '../../services/cartService';
import { useUserStore } from '../../store/useUserStore';

const route = useRoute();
const userStore = useUserStore();
const books = ref<BookData[]>([]);
const loading = ref(false);
const error = ref('');
const imageBroken = ref(false);

const bookId = computed(() => {
  const parsedId = Number(route.params.id);
  return Number.isSafeInteger(parsedId) && parsedId > 0 ? parsedId : null;
});

const book = computed(() =>
  books.value.find((item) => item.book_id === bookId.value),
);

watch(
  bookId,
  () => {
    imageBroken.value = false;
    error.value = bookId.value ? '' : 'The book URL is invalid.';
    if (bookId.value && !books.value.length) void loadBooks();
  },
  { immediate: true },
);

async function loadBooks(): Promise<void> {
  loading.value = true;
  error.value = '';
  try {
    const { data } = await getBook();
    books.value = data;
  } catch (cause) {
    error.value = getErrorMessage(cause);
  } finally {
    loading.value = false;
  }
}

function getErrorMessage(cause: unknown): string {
  if (axios.isAxiosError(cause)) {
    const responseMessage = cause.response?.data?.error;
    if (typeof responseMessage === 'string') return responseMessage;
    if (cause.request) return 'Cannot connect to the book service. Please try again.';
  }
  return cause instanceof Error ? cause.message : 'Unable to load this book. Please try again.';
}

async function addBookToCart(selectedBook: BookData): Promise<void> {
  try {
    if (userStore.userId) {
      await addCartItem(selectedBook.book_id);
    } else {
      saveGuestCart(addGuestCartItem(getGuestCart(), selectedBook));
    }
    ElMessage.success({
      message: `${selectedBook.title} added to your cart.`,
      placement: 'top',
      offset: 72,
      appendTo: document.body,
    });
  } catch (cause) {
    ElMessage.error({
      message: getErrorMessage(cause),
      placement: 'top',
      offset: 72,
      appendTo: document.body,
    });
  }
}
</script>

<style scoped>
.book-detail-page {
  --detail-ink: #38332d;
  --detail-muted: #70675d;
  --detail-line: #928779;
  --detail-paper: #f9f1e6;

  min-height: 65vh;
  padding: 30px max(24px, calc((100% - 1180px) / 2)) 80px;
  color: var(--detail-ink);
  background: var(--detail-paper);
  font-family: Arial, sans-serif;
}

.back-link {
  display: inline-flex;
  min-height: 40px;
  align-items: center;
  padding: 0 15px;
  border: 1px solid var(--detail-line);
  border-radius: 999px;
  margin-bottom: 5px;
  color: var(--detail-ink);
  background: rgb(255 255 255 / 28%);
  font-size: 13px;
  font-weight: 600;
  text-decoration: none;
  transition:
    color 160ms ease,
    background-color 160ms ease,
    border-color 160ms ease,
    transform 160ms ease;
}

.back-link:hover {
  border-color: #60472f;
  color: #fff;
  background: #60472f;
  transform: translateX(-2px);
}

.back-icon {
  font-size: 16px;
}

.back-link:focus-visible {
  outline: 3px solid #60472f;
  outline-offset: 3px;
}

@media (prefers-reduced-motion: reduce) {
  .back-link {
    transition: none;
  }
}

.product-overview {
  display: grid;
  grid-template-columns: minmax(250px, 0.8fr) minmax(0, 1.2fr);
  align-items: start;
  gap: clamp(36px, 7vw, 90px);
  padding: 10px 0 60px;
}

.product-cover {
  position: sticky;
  top: 84px;
  overflow: hidden;
  width: 100%;
  aspect-ratio: 0.7;
  background: #d8d1c6;
  box-shadow: 12px 18px 34px rgb(44 37 29 / 16%);
}

.product-cover img {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.cover-fallback {
  display: flex;
  height: 100%;
  flex-direction: column;
  align-items: center;
  justify-content: space-between;
  padding: 10%;
  color: #fff;
  background: linear-gradient(145deg, #53635b, #394a43);
  text-align: center;
}

.cover-fallback strong {
  max-width: 100%;
  overflow-wrap: anywhere;
  font-family: Georgia, "Times New Roman", serif;
  font-size: clamp(22px, 4vw, 40px);
  font-weight: 500;
  line-height: 1.12;
}

.cover-fallback small {
  font-size: 12px;
}

.detail-content {
  min-height: 320px;
}

.detail-error {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
  padding: 14px 18px;
  border: 1px solid #8a3028;
  color: #70251f;
  font-size: 13px;
}

.detail-error button {
  padding: 5px 0;
  border: 0;
  border-bottom: 1px solid currentColor;
  color: inherit;
  background: transparent;
  font: inherit;
  font-weight: 700;
  cursor: pointer;
}

.empty-state {
  padding: 60px 20px;
  color: #554d44;
  text-align: center;
}

@media (max-width: 760px) {
  .book-detail-page {
    padding-top: 24px;
  }

  .product-overview {
    grid-template-columns: minmax(0, 1fr);
    gap: 32px;
    padding-bottom: 42px;
  }

  .product-cover {
    position: relative;
    top: auto;
    width: min(100%, 360px);
    justify-self: center;
  }
}

@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    scroll-behavior: auto !important;
  }
}
</style>
