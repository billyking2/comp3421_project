<template>
  <section class="detail-info" aria-labelledby="book-title">
    <p class="detail-categories">{{ categories.length ? categories.join(' · ') : 'Book' }}</p>
    <h1 id="book-title">{{ book.title }}</h1>
    <p class="detail-author">by {{ book.author }}</p>
    <p class="detail-price">${{ Number(book.price).toFixed(2) }}</p>

    <div class="detail-description">
      <h2>About this book</h2>
      <p v-if="book.description" class="description-copy">{{ book.description }}</p>
      <p v-else class="description-copy description-unavailable">
        A description for this book is not available yet.
      </p>
    </div>


    <section class="book-specifications" aria-labelledby="specifications-title">
      <h2 id="specifications-title">Specifications</h2>
      <dl>
        <div>
          <dt>Catalog ID</dt>
          <dd>{{ book.book_id }}</dd>
        </div>
        <div>
          <dt>Availability</dt>
          <dd>{{ book.stock_quantity }} in stock</dd>
        </div>
      </dl>
    </section>

    <button
      class="add-to-cart"
      type="button"
      :disabled="book.stock_quantity < 1"
      @click="emit('add-to-cart', book)"
    >
      {{ book.stock_quantity < 1 ? 'Out of stock' : 'Add to cart' }}
    </button>
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { BookData } from '../../services/Data';
import { getBookCategories } from '../../utils/bookCatalog';

const props = defineProps<{
  book: BookData;
}>();

const emit = defineEmits<{
  'add-to-cart': [book: BookData];
}>();

const categories = computed(() => getBookCategories(props.book));
</script>

<style scoped>
.detail-info {
  color: #38332d;
  text-align: left;
}



.detail-categories {
  margin-top: 20px;
  color: #60472f;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

h1 {
  margin: 8px 0;
  color: #38332d;
  font-family: Georgia, "Times New Roman", serif;
  font-size: clamp(36px, 4vw, 56px);
  font-weight: 600;
  letter-spacing: -0.035em;
  line-height: 1.08;
}

h2 {
  margin: 0 0 12px;
  color: #38332d;
  font-family: Georgia, "Times New Roman", serif;
  font-size: 22px;
  font-weight: 500;
}

.detail-author {
  color: #554d44;
  font-size: 14px;
}

.detail-price {
  margin-top: 26px;
  color: #60472f;
  font-size: 24px;
  font-weight: 700;
  font-variant-numeric: tabular-nums;
}

.detail-description,
.book-specifications {
  margin-top: 28px;
}

.detail-description p,
.book-specifications dl {
  color: #554d44;
  font-size: 13px;
  line-height: 1.75;
}

.description-copy {
  white-space: pre-line;
}

.description-unavailable {
  color: #70675d;
  font-style: italic;
}

.book-specifications dl {
  margin: 0;
}

.book-specifications dl > div {
  display: grid;
  grid-template-columns: minmax(100px, 0.6fr) 1fr;
  gap: 16px;
  padding: 9px 0;
  border-bottom: 1px solid #c9c0b4;
}

.book-specifications dt {
  color: #70675d;
}

.book-specifications dd {
  margin: 0;
  color: #38332d;
  font-weight: 600;
}

.add-to-cart {
  z-index: 3;
  width: 100%;
  min-height: 52px;
  margin-top: 26px;
  border: 1px solid #2f2a24;
  color: #fff;
  background: #2f2a24;
  font: inherit;
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
  transition:
    background-color 160ms ease,
    color 160ms ease;
  box-shadow: 0 5px 16px rgb(44 37 29 / 18%);
}

.add-to-cart:hover:not(:disabled) {
  color: #2f2a24;
  background: transparent;
}

.add-to-cart:focus-visible {
  outline: 3px solid #60472f;
  outline-offset: 3px;
}

.add-to-cart:disabled {
  border-color: #70675d;
  background: #70675d;
  cursor: not-allowed;
}

@media (prefers-reduced-motion: reduce) {
  .add-to-cart {
    transition: none;
  }
}
</style>
