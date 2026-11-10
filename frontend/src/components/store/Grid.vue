<template>
  <div class="book-grid">
    <article v-for="book in books" :key="book.book_id" class="book-card">
      <div class="book-cover">
        <img
          v-if="book.image_url && !brokenImageIds.has(book.book_id)"
          :src="book.image_url"
          :alt="`Cover of ${book.title}`"
          loading="lazy"
          @error="markImageBroken(book.book_id)"
        />
        <div v-else class="cover-fallback">
          <strong>{{ book.title }}</strong>
          <small>{{ book.author }}</small>
        </div>
        
        <button
          class="cover-cart-button"
          type="button"
          :disabled="book.stock_quantity < 1"
          :aria-label="book.stock_quantity < 1 ? `${book.title} is out of stock` : `Add ${book.title} to cart`"
          @click="emit('add-to-cart', book)"
        >
          {{ book.stock_quantity < 1 ? 'Out of stock' : 'Add to Cart' }}
        </button>
      </div>

      <div class="book-information">
        <p class="book-category">{{ book.categories || 'Book' }}</p>
        <div class="book-title-row">
          <h2>{{ book.title }}</h2>
          <strong class="book-price">${{ Number(book.price).toFixed(2) }}</strong>
        </div>
        <p class="book-author">by {{ book.author }}</p>
      </div>
    </article>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import type { BookData } from '../../services/Data';

defineProps<{
  books: BookData[];
}>();

const emit = defineEmits<{
  'add-to-cart': [book: BookData];
}>();

const brokenImageIds = ref(new Set<number>());

function markImageBroken(bookId: number): void {
  brokenImageIds.value.add(bookId);
}
</script>

<style scoped>
.book-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: clamp(18px, 2.5vw, 32px) clamp(14px, 2vw, 24px);
}

.book-card {
  min-width: 0;
  color: #38332d;
  text-align: left;
}

.book-cover {
  position: relative;
  overflow: hidden;
  aspect-ratio: 0.7;
  background: #d8d1c6;
  box-shadow: 7px 10px 20px rgb(44 37 29 / 13%);
  transition:
    transform 220ms ease,
    box-shadow 220ms ease;
}

.book-card:hover .book-cover {
  transform: translateY(-4px);
  box-shadow: 10px 15px 25px rgb(44 37 29 / 18%);
}

.book-cover img {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.cover-cart-button {
  position: absolute;
  right: 12px;
  bottom: 12px;
  left: 12px;
  min-height: 42px;
  border: 1px solid #fff;
  color: #fff;
  background: #2f2a24;
  font: inherit;
  font-size: 12px;
  font-weight: 600;
  opacity: 0;
  pointer-events: none;
  transform: translateY(6px);
  transition:
    opacity 160ms ease,
    transform 160ms ease;
}

.book-card:hover .cover-cart-button,
.book-card:focus-within .cover-cart-button {
  opacity: 1;
  pointer-events: auto;
  transform: translateY(0);
}

.cover-cart-button:disabled {
  color: #fff;
  background: #4a433a;
  cursor: not-allowed;
}

.cover-cart-button:focus-visible {
  outline: 3px solid #fff;
  outline-offset: 2px;
}

.cover-fallback {
  display: flex;
  height: 100%;
  flex-direction: column;
  align-items: center;
  justify-content: space-between;
  padding: 10% 9%;
  color: #f5efe5;
  background: linear-gradient(145deg, #53635b, #394a43);
  text-align: center;
}

.cover-fallback span {
  font-size: clamp(6px, 0.65vw, 9px);
  letter-spacing: 0.18em;
}

.cover-fallback small {
  font-size: clamp(7px, 0.7vw, 10px);
}

.book-information {
  padding-top: 12px;
}

.book-category {
  overflow: hidden;
  margin-bottom: 5px;
  color: #80654d;
  font-size: 9px;
  letter-spacing: 0.08em;
  text-overflow: ellipsis;
  text-transform: uppercase;
  white-space: nowrap;
}

.book-title-row {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 8px;
}

.book-information h2 {
  display: -webkit-box;
  overflow: hidden;
  flex: 1;
  min-width: 0;
  margin: 0;
  color: #38332d;
  font-family: Georgia, "Times New Roman", serif;
  font-size: clamp(19px, 1.8vw, 23px);
  font-weight: 700;
  line-height: 1.2;
  text-overflow: ellipsis;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
}

.book-price {
  flex-shrink: 0;
  padding-top: 2px;
  color: #60472f;
  font-size: 12px;
  font-weight: 700;
  font-variant-numeric: tabular-nums;
}

.book-author {
  overflow: hidden;
  margin-top: 4px;
  color: #70675d;
  font-size: 10px;
  text-overflow: ellipsis;
  white-space: nowrap;
}

@media (max-width: 1000px) {
  .book-grid {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
}

@media (max-width: 760px) {
  .book-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (hover: none) {
  .cover-cart-button {
    opacity: 1;
    pointer-events: auto;
    transform: translateY(0);
  }
}

@media (prefers-reduced-motion: reduce) {
  .book-cover,
  .cover-cart-button {
    transition: none;
  }
}
</style>
