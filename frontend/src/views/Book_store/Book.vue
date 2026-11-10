<template>
  <main class="book-listing">
    <header class="listing-heading">
      <h1>Book</h1>
    </header>

    <section class="listing-toolbar" aria-label="Book search and sorting">
      <BookSearch v-model="searchTerm" />
      <label class="sort-control">
        <span>Sort by</span>
        <select v-model="sortOrder" aria-label="Sort books">
          <option value="title-asc">Title: A to Z</option>
          <option value="price-asc">Price: Low to high</option>
          <option value="price-desc">Price: High to low</option>
        </select>
      </label>
    </section>

    <div v-if="error" class="listing-error" role="alert">
      <p>{{ error }}</p>
      <button type="button" @click="loadBooks">Try again</button>
    </div>

    <!-- Book listing layout with filters and results -->
    <div class="listing-layout">
      <BookFilter
        :books="books"
        :search-term="searchTerm"
        :selected-categories="selectedCategories"
        :selected-price-band="selectedPriceBand"
        @update:selected-categories="selectedCategories = $event"
        @update:selected-price-band="selectedPriceBand = $event"
      />

      <!-- Book results section with pagination -->
      <section class="results" aria-label="Book results" aria-live="polite">
        <div class="results-heading">
          <p>
            <strong>{{ filteredBooks.length }}</strong>
            {{ filteredBooks.length === 1 ? 'book' : 'books' }} found
          </p>
          <button
            v-if="hasActiveFilters"
            class="clear-filters"
            type="button"
            @click="clearFilters"
          >
            Clear filters
          </button>
        </div>
        
        <!-- Display the book grid or an empty state message based on the filtered results -->
        <div v-loading="loading" class="results-content">
          <BookGrid
            v-if="paginatedBooks.length"
            :books="paginatedBooks"
            @add-to-cart="addBookToCart"
          />
          <p v-else-if="!loading && !error" class="empty-state">
            No books match your search. Try changing or clearing your filters.
          </p>
        </div>

        <nav
          v-if="pageCount > 1"
          class="pagination"
          aria-label="Book pages"
        >
          <button
            type="button"
            :disabled="currentPage === 1"
            aria-label="Previous page"
            @click="currentPage -= 1"
          >
            Previous
          </button>
          <span>Page {{ currentPage }} of {{ pageCount }}</span>
          <button
            type="button"
            :disabled="currentPage === pageCount"
            aria-label="Next page"
            @click="currentPage += 1"
          >
            Next
          </button>
        </nav>
      </section>
    </div>
  </main>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue';
import axios from 'axios';
import BookFilter from '../../components/store/Filter.vue';
import BookGrid from '../../components/store/Grid.vue';
import BookSearch from '../../components/store/Search.vue';
import { getBook, type BookData } from '../../services/Data';
import {
  addCartItem,
  addGuestCartItem,
  getGuestCart,
  saveGuestCart,
} from '../../services/cartService';
import { useUserStore } from '../../store/useUserStore';
import { ElMessage } from 'element-plus';
import { getBookCategories, matchesPriceBand } from '../../utils/bookCatalog';

type SortOrder = 'title-asc' | 'price-asc' | 'price-desc';

const pageSize = 12;
const books = ref<BookData[]>([]);
const searchTerm = ref('');
const selectedCategories = ref<string[]>([]);
const selectedPriceBand = ref('');
const sortOrder = ref<SortOrder>('title-asc');
const currentPage = ref(1);
const loading = ref(false);
const error = ref('');
const userStore = useUserStore();

const hasActiveFilters = computed(() =>
  Boolean(searchTerm.value.trim() || selectedCategories.value.length || selectedPriceBand.value),
);

// Compute the filtered books based on search term, selected categories, and selected price band
const filteredBooks = computed(() => {
  const query = searchTerm.value.trim().toLocaleLowerCase();

  // Check if a book matches the current search term
  return books.value
    .filter((book) => {
      const categories = getBookCategories(book);
      const matchesSearch = !query ||
        book.title.toLocaleLowerCase().includes(query) ||
        book.author.toLocaleLowerCase().includes(query) ||
        categories.some((category) => category.toLocaleLowerCase().includes(query));
      const matchesCategory = !selectedCategories.value.length ||
        selectedCategories.value.some((category) => categories.includes(category));
      const matchesPrice = matchesPriceBand(book, selectedPriceBand.value);

      return matchesSearch && matchesCategory && matchesPrice;
    })
    // Sort the filtered books based on the selected sort order
    .sort((first, second) => {
      if (sortOrder.value === 'price-asc') {
        return Number(first.price) - Number(second.price) || first.title.localeCompare(second.title);
      }
      if (sortOrder.value === 'price-desc') {
        return Number(second.price) - Number(first.price) || first.title.localeCompare(second.title);
      }
      return first.title.localeCompare(second.title);
    });
});

const pageCount = computed(() => Math.ceil(filteredBooks.value.length / pageSize));
const paginatedBooks = computed(() => {
  const start = (currentPage.value - 1) * pageSize;
  return filteredBooks.value.slice(start, start + pageSize);
});

watch([searchTerm, selectedCategories, selectedPriceBand, sortOrder], () => {
  currentPage.value = 1;
});

onMounted(() => {
  void loadBooks();
});

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
  return cause instanceof Error ? cause.message : 'Unable to load books. Please try again.';
}

function clearFilters(): void {
  searchTerm.value = '';
  selectedCategories.value = [];
  selectedPriceBand.value = '';
}

async function addBookToCart(book: BookData): Promise<void> {
  try {
    if (userStore.userId) {
      await addCartItem(book.book_id);
    } else {
      saveGuestCart(addGuestCartItem(getGuestCart(), book));
    }
    ElMessage.success({
      message: `${book.title} added to your cart.`,
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
.book-listing {
  --listing-ink: #38332d;
  --listing-muted: #70675d;
  --listing-line: #928779;
  --listing-paper: #f9f1e6;

  min-height: 65vh;
  padding: clamp(42px, 6vw, 78px) max(24px, calc((100% - 1280px) / 2)) 90px;
  color: var(--listing-ink);
  background: var(--listing-paper);
  font-family: Arial, sans-serif;
  text-align: left;
}

.listing-heading {
  margin-bottom: 36px;
}

.listing-heading h1 {
  margin: 10px 0 12px;
  color: var(--listing-ink);
  font-family: Georgia, "Times New Roman", serif;
  font-size: clamp(38px, 5vw, 58px);
  font-weight: 400;
  letter-spacing: -0.045em;
}

.listing-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
  padding: 18px 0;
  border-top: 1px solid var(--listing-line);
  border-bottom: 1px solid var(--listing-line);
}

.sort-control {
  display: flex;
  flex-shrink: 0;
  align-items: center;
  gap: 10px;
  color: var(--listing-muted);
  font-size: 12px;
}

.sort-control select {
  min-height: 38px;
  padding: 0 32px 0 10px;
  border: 1px solid var(--listing-line);
  border-radius: 0;
  color: var(--listing-ink);
  background: transparent;
  font: inherit;
}

.listing-layout {
  display: grid;
  grid-template-columns: minmax(190px, 240px) minmax(0, 1fr);
  align-items: start;
  gap: clamp(26px, 4vw, 56px);
  padding-top: 30px;
}

.results {
  min-width: 0;
}

.results-heading {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
  color: var(--listing-muted);
  font-size: 12px;
}

.results-heading strong {
  color: var(--listing-ink);
}

.clear-filters,
.listing-error button {
  padding: 4px;
  border: 1px solid currentColor;
  color: var(--listing-ink);
  background: semi-transparent;
  font: inherit;
  cursor: pointer;
}

.results-content {
  min-height: 260px;
}

.empty-state {
  padding: 60px 20px;
  color: var(--listing-muted);
  text-align: center;
}

.listing-error {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
  padding: 14px 18px;
  border: 1px solid #c77b72;
  color: #7c3028;
  font-size: 13px;
}

.pagination {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 22px;
  margin-top: 32px;
  color: var(--listing-muted);
  font-size: 12px;
}

.pagination button {
  padding: 9px 13px;
  border: 1px solid var(--listing-line);
  color: var(--listing-ink);
  background: transparent;
  font: inherit;
  cursor: pointer;
}

.pagination button:disabled {
  opacity: 0.45;
  cursor: not-allowed;
}

@media (max-width: 700px) {
  .listing-toolbar {
    align-items: stretch;
    flex-direction: column;
  }

  .listing-layout {
    grid-template-columns: 1fr;
  }

  .sort-control {
    justify-content: space-between;
  }
}
</style>
