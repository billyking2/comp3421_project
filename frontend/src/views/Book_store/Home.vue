<template>
  <main class="bookstore-home">
    <section class="bestseller-hero" aria-labelledby="hero-title">
      <div class="hero-watermark" aria-hidden="true">READ<br />SOMETHING<br />WONDERFUL</div>

      <div class="hero-content">
        <div class="hero-copy">
          <h1 id="hero-title">Stories to<br />stay with you.</h1>
          <p>Discover the books readers are taking home right now.</p>
          <RouterLink class="hero-link" to="/book">
            Explore the collection <span aria-hidden="true">↗</span>
          </RouterLink>
        </div>

        <div v-loading="loading" class="featured-books" aria-label="Top-selling books">
          <p v-if="error" class="hero-message">{{ error }}</p>
          <p v-else-if="!topSellers.length && !loading" class="hero-message">
            Our next reader favorites are waiting to be discovered.
          </p>
          <RouterLink
            v-for="(book, index) in topSellers.slice(0, 3)"
            :key="book.book_id"
            class="featured-book"
            :class="`featured-book-${index + 1}`"
            to="/book"
          >
            <div class="book-cover">
              <img
                v-if="book.image_url && !brokenImageIds.has(book.book_id)"
                :src="book.image_url"
                :alt="`Cover of ${book.title}`"
                @error="markImageBroken(book.book_id)"
              />
              <div v-else class="cover-fallback">
                <span>THE BOOKSHOP</span>
                <strong>{{ book.title }}</strong>
                <small>{{ book.author }}</small>
              </div>
            </div>
            <div class="featured-caption">
              <span class="featured-rank">0{{ index + 1 }} / READER FAVORITE</span>
              <strong>{{ book.title }}</strong>
              <small>{{ book.author }}</small>
            </div>
          </RouterLink>
        </div>
      </div>
    </section>

    <section class="category-section" aria-labelledby="category-title">
      <header class="section-heading">
        <div>
          <span class="eyebrow">FIND YOUR NEXT CHAPTER</span>
          <h2 id="category-title">Browse by category</h2>
        </div>
        <RouterLink to="/book" class="all-books-link">View all books <span>↗</span></RouterLink>
      </header>

      <el-alert
        v-if="error"
        :title="error"
        type="error"
        show-icon
        :closable="false"
      />

      <section
        v-for="(category, categoryIndex) in categories"
        :key="category.name"
        class="category-carousel"
        :aria-label="`${category.name} books`"
      >
        <div class="category-heading">
          <div>
            <h3>{{ category.name }}</h3>
          </div>
          <span class="category-count">{{ category.books.length }} titles</span>
        </div>

        <el-carousel
          v-if="category.books.length"
          :interval="0"
          :loop="true"
          :arrow="category.books.length <= arrowDisplayNo ? 'never' : 'always'"
          indicator-position="none"
          height="370px"
          class="book-carousel"
        >
          <el-carousel-item
            v-for="(slide, slideIndex) in makeSlides(category.books)"
            :key="`${category.name}-${slideIndex}`"
          >
            <div class="book-slide">
              <div
                v-for="book in slide"
                :key="book.book_id"
                class="category-book"
              >
                <RouterLink to="/book" class="category-book-link">
                  <div class="category-cover">
                    <img
                      v-if="book.image_url && !brokenImageIds.has(book.book_id)"
                      :src="book.image_url"
                      :alt="`Cover of ${book.title}`"
                      @error="markImageBroken(book.book_id)"
                    />
                    <div v-else class="cover-fallback">
                      <span>THE BOOKSHOP</span>
                      <strong>{{ book.title }}</strong>
                      <small>{{ book.author }}</small>
                    </div>
                  </div>
                  <strong class="category-book-title">{{ book.title }}</strong>
                  <span class="category-book-author">{{ book.author }}</span>
                  <span class="category-book-price">${{ Number(book.price).toFixed(2) }}</span>
                </RouterLink>
                <el-button
                  class="add-to-cart-button"
                  size="small"
                  :disabled="book.stock_quantity < 1"
                  @click="addBookToCart(book)"
                >
                  {{ book.stock_quantity < 1 ? 'Out of stock' : 'Add to cart' }}
                </el-button>
              </div>
            </div>
          </el-carousel-item>
        </el-carousel>
        <hr v-if="categoryIndex < categories.length - 1" class="category-divider" aria-hidden="true">
      </section>
    </section>
  </main>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue';
import { RouterLink } from 'vue-router';
import { getBook, getPopularBook, type DashboardBookData } from '../../services/Data';
import {
  addCartItem,
  addGuestCartItem,
  getGuestCart,
  saveGuestCart,
} from '../../services/cartService';
import { useUserStore } from '../../store/useUserStore';
import { ElMessage } from 'element-plus';
import axios from 'axios';
import { getErrorMessage as getAuthErrorMessage } from '../../utils/authStatus';

type CatalogBook = DashboardBookData;

const books = ref<CatalogBook[]>([]);
const userStore = useUserStore();
const topSellerIds = ref<number[]>([]);
const brokenImageIds = ref(new Set<number>());
const loading = ref(false);
const error = ref('');
const booksPerSlide = ref(4);
const arrowDisplayNo = ref(4);

const topSellers = computed(() => {
  const booksById = new Map(books.value.map((book) => [book.book_id, book]));
  return topSellerIds.value
    .map((bookId) => booksById.get(bookId))
    .filter((book): book is CatalogBook => book !== undefined);
});

const categories = computed(() => {
  const byCategory = new Map<string, CatalogBook[]>();

  for (const book of books.value) {
    const bookCategories = (book.categories ?? '')
      .split(',')
      .map((category) => category.trim())
      .filter(Boolean);

    for (const name of bookCategories) {
      const categoryBooks = byCategory.get(name) ?? [];
      categoryBooks.push(book);
      byCategory.set(name, categoryBooks);
    }
  }

  return Array.from(byCategory, ([name, categoryBooks]) => ({
    name,
    books: categoryBooks,
  }));
});

function updateBooksPerSlide(): void {
  booksPerSlide.value = window.matchMedia('(max-width: 850px)').matches ? 2 : 4;
  arrowDisplayNo.value = 2;
}

onMounted(() => {
  updateBooksPerSlide();
  window.addEventListener('resize', updateBooksPerSlide);
  void loadHomeData();
});

onUnmounted(() => {
  window.removeEventListener('resize', updateBooksPerSlide);
});

async function loadHomeData(): Promise<void> {
  loading.value = true;
  error.value = '';

  try {
    const [bookResult, popularResult] = await Promise.allSettled([getBook(), getPopularBook()]);

    if (bookResult.status === 'fulfilled') {
      books.value = bookResult.value.data;
    } else {
      error.value = getErrorMessage(bookResult.reason);
    }

    if (popularResult.status === 'fulfilled') {
      topSellerIds.value = popularResult.value.data
        .map((book) => book.book_id)
        .filter((bookId): bookId is number => bookId !== null);
    } else {
      error.value = [error.value, getErrorMessage(popularResult.reason)].filter(Boolean).join(' ');
    }
  } finally {
    loading.value = false;
  }
}

function getErrorMessage(cause: unknown): string {
  if (axios.isAxiosError(cause)) return getAuthErrorMessage(cause);
  return cause instanceof Error ? cause.message : 'Unable to load the book collection.';
}

function makeSlides(items: CatalogBook[]): CatalogBook[][] {
  const slides: CatalogBook[][] = [];
  for (let index = 0; index < items.length; index += booksPerSlide.value) {
    slides.push(items.slice(index, index + booksPerSlide.value));
  }
  return slides;
}

function markImageBroken(bookId: number): void {
  brokenImageIds.value.add(bookId);
}

async function addBookToCart(book: CatalogBook): Promise<void> {
  try {
    if (userStore.userId) {
      await addCartItem(book.book_id);
    } else {
      const updatedCart = addGuestCartItem(getGuestCart(), book);
      saveGuestCart(updatedCart);
    }

    ElMessage.success(`${book.title} added to your cart.`);
  } catch (cause) {
    ElMessage.error(getErrorMessage(cause));
  }
}
</script>

<style scoped>
.bookstore-home {
  --home-ink: #38332d;
  --home-muted: #827a70;
  --home-line: #d7d1c8;
  --home-paper: #eeece7;
  --home-brown: #80654d;

  color: var(--home-ink);
  font-family: Arial, sans-serif;
  text-align: left;
}

.bestseller-hero {
  position: relative;
  display: grid;
  min-height: calc(100svh - 60px);
  overflow: hidden;
  place-items: center;
  padding: clamp(34px, 6vw, 82px) clamp(22px, 7vw, 100px) 68px;
  background: #e9e7e2;
}

.hero-content {
  position: relative;
  z-index: 1;
  display: grid;
  width: min(100%, 1320px);
  grid-template-columns: minmax(230px, 0.75fr) minmax(0, 1.65fr);
  align-items: center;
  gap: clamp(32px, 7vw, 110px);
}

.hero-watermark {
  position: absolute;
  top: 7%;
  left: 18%;
  color: rgb(77 70 61 / 6%);
  font-family: Georgia, "Times New Roman", serif;
  font-size: clamp(72px, 14vw, 190px);
  letter-spacing: -0.07em;
  line-height: 0.78;
  pointer-events: none;
  white-space: nowrap;
}

.hero-copy {
  position: relative;
  z-index: 2;
  padding-bottom: 25px;
}

.eyebrow{
  color: var(--home-brown);
  font-size: 10px;
  font-weight: 600;
  letter-spacing: 0.18em;
}

.hero-copy h1 {
  margin: 20px 0 15px;
  color: var(--home-ink);
  font-family: Georgia, "Times New Roman", serif;
  font-size: clamp(43px, 5vw, 68px);
  font-weight: 400;
  letter-spacing: -0.055em;
  line-height: 0.99;
}

.hero-copy p {
  max-width: 290px;
  color: var(--home-muted);
  font-size: 14px;
  line-height: 1.8;
}

.hero-link,
.all-books-link {
  display: inline-flex;
  align-items: center;
  gap: 12px;
  color: var(--home-ink);
  font-size: 12px;
  text-decoration: none;
}

.hero-link {
  margin-top: 24px;
  padding-bottom: 7px;
  border-bottom: 1px solid #a99a88;
}

.hero-link span,
.all-books-link span {
  color: var(--home-brown);
  font-size: 17px;
}

.featured-books {
  display: grid;
  min-height: 460px;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  align-items: center;
  gap: clamp(16px, 3vw, 42px);
}

.featured-book {
  display: flex;
  min-width: 0;
  flex-direction: column;
  color: inherit;
  text-decoration: none;
}

.featured-book-1 {
  transform: translateY(28px) rotate(-1.5deg);
}

.featured-book-2 {
  z-index: 1;
  transform: translateY(-18px);
}

.featured-book-3 {
  transform: translateY(28px) rotate(1.5deg);
}

.book-cover,
.category-cover {
  position: relative;
  overflow: hidden;
  background: #d8d1c6;
  box-shadow: 9px 13px 25px rgb(44 37 29 / 18%);
}

.book-cover {
  aspect-ratio: 0.68;
  transition:
    transform 280ms ease,
    box-shadow 280ms ease;
}

.featured-book:hover .book-cover {
  transform: translateY(-8px);
  box-shadow: 12px 21px 30px rgb(44 37 29 / 22%);
}

.book-cover img,
.category-cover img {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.cover-fallback {
  display: flex;
  width: 100%;
  height: 100%;
  flex-direction: column;
  align-items: center;
  justify-content: space-between;
  padding: 10% 9%;
  color: #f5efe5;
  background:
    linear-gradient(155deg, rgb(255 255 255 / 12%), transparent 48%),
    linear-gradient(145deg, #6e7c75, #394a43);
  text-align: center;
}

.featured-book:nth-child(3n) .cover-fallback,
.category-book:nth-child(3n) .cover-fallback {
  background:
    linear-gradient(155deg, rgb(255 255 255 / 12%), transparent 48%),
    linear-gradient(145deg, #9b8067, #66503e);
}

.featured-book:nth-child(3n + 2) .cover-fallback,
.category-book:nth-child(3n + 2) .cover-fallback {
  color: #f4eddf;
  background:
    linear-gradient(155deg, rgb(255 255 255 / 12%), transparent 48%),
    linear-gradient(145deg, #7d6670, #4e4149);
}

.cover-fallback span {
  font-size: clamp(6px, 0.65vw, 9px);
  letter-spacing: 0.18em;
}

.cover-fallback strong {
  display: -webkit-box;
  overflow: hidden;
  font-family: Georgia, "Times New Roman", serif;
  font-size: clamp(14px, 1.55vw, 23px);
  font-weight: 400;
  line-height: 1.1;
  text-overflow: ellipsis;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 4;
}

.cover-fallback small {
  font-size: clamp(7px, 0.7vw, 10px);
  letter-spacing: 0.06em;
}

.featured-caption {
  display: grid;
  gap: 4px;
  padding-top: 15px;
}

.featured-rank {
  color: var(--home-brown);
  font-size: 8px;
  letter-spacing: 0.13em;
}

.featured-caption strong {
  overflow: hidden;
  font-family: Georgia, "Times New Roman", serif;
  font-size: 14px;
  font-weight: 500;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.featured-caption small {
  color: var(--home-muted);
  font-size: 10px;
}

.hero-index {
  position: absolute;
  right: 7%;
  bottom: 30px;
  color: #847d73;
  font-family: Georgia, "Times New Roman", serif;
  font-size: 11px;
  letter-spacing: 0.12em;
}

.hero-message {
  grid-column: 1 / -1;
  align-self: center;
  color: var(--home-muted);
  text-align: center;
}

.category-section {
  display: grid;
  width: min(100% - 48px, 1280px);
  gap: 38px;
  margin: 0 auto;
  padding: clamp(54px, 8vw, 104px) 0 90px;
}

.section-heading {
  display: flex;
  align-items: end;
  justify-content: space-between;
  gap: 24px;
  padding-bottom: 24px;
  border-bottom: 1px solid var(--home-line);
}

.section-heading h2 {
  margin: 9px 0 0;
  color: var(--home-ink);
  font-family: Georgia, "Times New Roman", serif;
  font-size: clamp(32px, 4vw, 48px);
  font-weight: 400;
  letter-spacing: -0.045em;
}

.all-books-link {
  padding-bottom: 5px;
  white-space: nowrap;
}

.category-carousel {
  min-width: 0;
}

.category-divider {
  height: 1px;
  margin: clamp(28px, 4vw, 44px) 0 0;
  border: 0;
  background: linear-gradient(
    90deg,
    transparent,
    var(--home-line) 12%,
    var(--home-line) 88%,
    transparent
  );
}

.category-heading {
  display: flex;
  align-items: end;
  justify-content: space-between;
  margin-bottom: 15px;
}

.category-heading h3 {
  margin: 4px 0 0;
  color: var(--home-ink);
  font-family: Georgia, "Times New Roman", serif;
  font-size: 28px;
  font-weight: 400;
}

.category-count {
  padding-bottom: 4px;
  color: var(--home-muted);
  font-size: 11px;
}

.book-carousel {
  --el-carousel-arrow-background: rgb(255 253 249 / 92%);
  --el-carousel-arrow-hover-background: #fff;
  --el-carousel-arrow-font-size: 16px;
}

.book-slide {
  display: grid;
  height: 100%;
  grid-template-columns: repeat(4, minmax(0, 190px));
  align-items: start;
  justify-content: center;
  gap: clamp(16px, 3vw, 36px);
  padding: 6px 48px 20px;
}

.category-book {
  display: flex;
  min-width: 0;
  flex-direction: column;
  align-items: flex-start;
  color: var(--home-ink);
  text-decoration: none;
}

.category-book-link {
  display: flex;
  width: 100%;
  min-width: 0;
  flex-direction: column;
  align-items: flex-start;
  color: inherit;
  text-decoration: none;
}

.add-to-cart-button {
  margin-top: 9px;
}

.category-cover {
  width: min(100%, 190px);
  aspect-ratio: 0.7;
  margin-bottom: 13px;
  transition:
    transform 220ms ease,
    box-shadow 220ms ease;
}

.category-book:hover .category-cover {
  transform: translateY(-5px);
  box-shadow: 10px 18px 26px rgb(44 37 29 / 19%);
}

.category-book-title {
  display: -webkit-box;
  overflow: hidden;
  max-width: 190px;
  font-family: Georgia, "Times New Roman", serif;
  font-size: 15px;
  font-weight: 500;
  line-height: 1.35;
  text-overflow: ellipsis;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
}

.category-book-author {
  overflow: hidden;
  max-width: 190px;
  margin-top: 4px;
  color: var(--home-muted);
  font-size: 11px;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.category-book-price {
  margin-top: 7px;
  color: var(--home-brown);
  font-size: 12px;
  font-weight: 600;
}

:deep(.book-carousel .el-carousel__container) {
  overflow: visible;
}

:deep(.book-carousel .el-carousel__arrow) {
  width: 34px;
  height: 34px;
  border: 1px solid var(--home-line);
  color: var(--home-ink);
  box-shadow: 0 3px 12px rgb(44 37 29 / 8%);
}

:deep(.book-carousel .el-carousel__arrow--left) {
  left: 0;
}

:deep(.book-carousel .el-carousel__arrow--right) {
  right: 0;
}

@media (max-width: 850px) {
  .bestseller-hero {
    min-height: auto;
    padding-block: 70px 80px;
  }

  .hero-content {
    grid-template-columns: 1fr;
    gap: 30px;
  }

  .hero-copy {
    max-width: 560px;
  }

  .hero-copy h1 br {
    display: none;
  }

  .featured-books {
    min-height: 0;
  }

  .featured-book-1,
  .featured-book-2,
  .featured-book-3 {
    transform: none;
  }

  .book-carousel {
    height: 350px !important;
  }

  .book-slide {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 12px 18px;
  }
}

@media (max-width: 560px) {
  .bestseller-hero {
    padding: 48px 20px 68px;
  }

  .hero-watermark {
    top: 15%;
    left: 0;
    font-size: 25vw;
  }

  .featured-books {
    gap: 12px;
  }

  .featured-caption {
    padding-top: 10px;
  }

  .featured-caption strong {
    font-size: 11px;
  }

  .featured-rank,
  .featured-caption small {
    font-size: 8px;
  }

  .category-section {
    width: calc(100% - 36px);
    gap: 30px;
  }

  .section-heading {
    align-items: flex-start;
    flex-direction: column;
  }

  .category-heading h3 {
    font-size: 24px;
  }

  .book-slide {
    padding-inline: 38px;
  }

  .category-cover {
    width: min(100%, 145px);
  }
  
}

@media (prefers-reduced-motion: reduce) {
  .book-cover,
  .category-cover {
    transition: none;
  }
}
</style>
