<template>
  <aside class="book-filters" aria-label="Filter books">
    <div class="filter-heading">
      <h2>Filters</h2>
      <span>{{ books.length }} total</span>
    </div>

    // Price filter
    <fieldset v-if="priceBands.length" class="filter-group">
      <legend>Price</legend>
      <label class="filter-option">
        <input
          type="radio"
          name="price-band"
          value=""
          :checked="selectedPriceBand === ''"
          @change="emit('update:selectedPriceBand', '')"
        />
        <span>All prices</span>
        <span class="option-count">{{ priceAvailableCount }}</span>
      </label>
    // Price filter options
      <label
        v-for="band in priceBands"
        :key="band.id"
        class="filter-option"
      >
        <input
          type="radio"
          name="price-band"
          :value="band.id"
          :checked="selectedPriceBand === band.id"
          :disabled="band.count === 0 && selectedPriceBand !== band.id"
          @change="emit('update:selectedPriceBand', band.id)"
        />
        <span>{{ band.label }}</span>
        <span class="option-count">{{ band.count }}</span>
      </label>
    </fieldset>

    <fieldset v-if="categoryOptions.length" class="filter-group">
      <legend>Category</legend>
      <label
        v-for="category in categoryOptions"
        :key="category.name"
        class="filter-option"
      >
        <input
          type="checkbox"
          :value="category.name"
          :checked="selectedCategories.includes(category.name)"
          :disabled="category.count === 0 && !selectedCategories.includes(category.name)"
          @change="toggleCategory(category.name, $event)"
        />
        <span>{{ category.name }}</span>
        <span class="option-count">{{ category.count }}</span>
      </label>
    </fieldset>
  </aside>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { BookData } from '../../services/Data';
import { getBookCategories, matchesPriceBand, PRICE_BANDS } from '../../utils/bookCatalog';

interface PriceBand {
  id: string;
  label: string;
  count: number;
}

const props = defineProps<{
  books: BookData[];
  searchTerm: string;
  selectedCategories: string[];
  selectedPriceBand: string;
}>();

const emit = defineEmits<{
  'update:selectedCategories': [categories: string[]];
  'update:selectedPriceBand': [band: string];
}>();

const query = computed(() => props.searchTerm.trim().toLocaleLowerCase());

// Compute the available categories and their counts based on the current search term and selected price band
const categoryOptions = computed(() => {
  const names = new Set(props.books.flatMap(getBookCategories));
  return Array.from(names)
    .sort((first, second) => first.localeCompare(second))
    .map((name) => ({
      name,
      count: props.books.filter((book) =>
        matchesSearch(book) &&
        matchesPriceBand(book, props.selectedPriceBand) &&
        getBookCategories(book).includes(name),
      ).length,
    }));
});

// Compute the available price bands and their counts based on the current search term and selected categories
const priceBands = computed<PriceBand[]>(() =>
  PRICE_BANDS.map((band) => ({
    ...band,
    count: countForPriceBand(band.id),
  })),
);

// Compute the total number of books available for the current search term, selected categories
const priceAvailableCount = computed(() =>
  props.books.filter((book) =>
    matchesSearch(book) && matchesSelectedCategories(book)
  ).length,
);

// Count the number of books that match the current search term, selected categories, and a specific price band
function countForPriceBand(band: string): number {
  return props.books.filter((book) =>
    matchesSearch(book) &&
    matchesSelectedCategories(book) &&
    matchesPriceBand(book, band),
  ).length;
}

function matchesSearch(book: BookData): boolean {
  return !query.value ||
    book.title.toLocaleLowerCase().includes(query.value) ||
    book.author.toLocaleLowerCase().includes(query.value) ||
    getBookCategories(book).some((category) => category.toLocaleLowerCase().includes(query.value));
}

// Check if a book matches the currently selected categories
function matchesSelectedCategories(book: BookData): boolean {
  return !props.selectedCategories.length ||
    props.selectedCategories.some((category) => getBookCategories(book).includes(category));
}

// Toggle a category in the selected categories list when a checkbox is clicked
function toggleCategory(category: string, event: Event): void {
  const checked = (event.target as HTMLInputElement).checked;
  const nextCategories = checked
    ? [...props.selectedCategories, category]
    : props.selectedCategories.filter((selected) => selected !== category);
  emit('update:selectedCategories', nextCategories);
}
</script>

<style scoped>
.book-filters {
  position: sticky;
  top: 76px;
  color: #38332d;
  text-align: left;
}

.filter-heading {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-bottom: 15px;
  border-bottom: 1px solid #d7d1c8;
}

.filter-heading h2 {
  margin: 0;
  color: #38332d;
  font-family: Georgia, "Times New Roman", serif;
  font-size: 22px;
  font-weight: 400;
}

.filter-heading > span {
  color: #70675d;
  font-size: 10px;
}

.filter-group {
  display: grid;
  gap: 12px;
  margin: 20px 0 0;
  padding: 0 0 20px;
  border: 0;
  border-bottom: 1px solid #d7d1c8;
}

.filter-group legend {
  width: 100%;
  margin-bottom: 14px;
  color: #38332d;
  font-size: 12px;
  font-weight: 700;
}

.filter-option {
  display: grid;
  grid-template-columns: 15px minmax(0, 1fr) auto;
  align-items: center;
  gap: 9px;
  color: #655e55;
  font-size: 11px;
  cursor: pointer;
}

.filter-option input {
  width: 14px;
  height: 14px;
  margin: 0;
  accent-color: #80654d;
}

.filter-option input:disabled {
  cursor: not-allowed;
}

.filter-option:has(input:disabled) {
  color: #aaa39a;
  cursor: not-allowed;
}

.option-count {
  color: #70675d;
  font-variant-numeric: tabular-nums;
}

@media (max-width: 700px) {
  .book-filters {
    position: static;
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 18px;
  }

  .filter-heading {
    grid-column: 1 / -1;
  }

  .filter-group {
    margin-top: 0;
  }
}

@media (max-width: 440px) {
  .book-filters {
    grid-template-columns: 1fr;
  }
}
</style>
