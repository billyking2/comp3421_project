<template>
  <label class="book-search">
    <input
      v-model="model"
      type="search"
      placeholder="Search title, author, or category"
      aria-label="Search books by title, author, or category"
    />
  </label>
</template>

<script setup lang="ts">
const model = defineModel<string>({
  required: true,
});
</script>

<style scoped>
.book-search {
  display: flex;
  width: min(100%, 520px);
  min-height: 42px;
  align-items: center;
  gap: 10px;
  border-bottom: 1px solid #928779;
}

.book-search input {
  width: 100%;
  border: 0;
  outline: 0;
  color: #38332d;
  background: transparent;
  font: inherit;
  font-size: 13px;
}

.book-search input::placeholder {
  color: #70675d;
}

.book-search:focus-within {
  border-color: #80654d;
}
</style>