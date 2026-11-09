<template>
  <main class="cart-page">
    <div class="cart-content">
      <header class="cart-heading">
        <div>
          <h1>Shopping cart</h1>
        </div>
        <el-button :loading="loading" @click="loadCart">Refresh</el-button>
      </header>

      <el-alert
        v-if="error"
        class="cart-error"
        :title="error"
        type="error"
        show-icon
        :closable="false"
      />

      <el-card class="cart-card" shadow="never">
        <div class="add-book-row">
          <el-select
            v-model="selectedBookId"
            class="book-picker"
            filterable
            clearable
            placeholder="Add a book to your cart"
            aria-label="Select a book to add"
          >
            <el-option
              v-for="book in availableBooks"
              :key="book.book_id"
              :label="`${book.title} — $${Number(book.price).toFixed(2)}`"
              :value="book.book_id"
            />
          </el-select>
          <el-button
            type="primary"
            :loading="addingBook"
            :disabled="!selectedBookId"
            @click="addSelectedBook"
          >
            Add book
          </el-button>
        </div>

        <div v-if="loading && cartItems.length === 0" class="cart-loading">
          <el-skeleton :rows="4" animated />
        </div>
        <el-empty
          v-else-if="cartItems.length === 0 && !error"
          description="Your cart is waiting for its first book."
        >
          <RouterLink to="/" class="browse-link">Browse books</RouterLink>
        </el-empty>
        <div v-else-if="cartItems.length" class="cart-layout">
          <section class="cart-items" aria-label="Books in your cart">
            <article v-for="item in cartItems" :key="item.book_id" class="cart-item">
              <img
                v-if="item.image_url"
                class="book-image"
                :src="item.image_url"
                :alt="`Cover of ${item.title}`"
              />
              <div v-else class="book-image book-image-fallback" aria-hidden="true">
                <span>THE BOOKSHOP</span>
              </div>

              <div class="item-details">
                <h2>{{ item.title }}</h2>
                <p>{{ item.author }}</p>
                <span class="item-unit-price">${{ item.price.toFixed(2) }} each</span>
                <el-tag v-if="!isBookAvailable(item)" type="danger" size="small">
                  No longer available
                </el-tag>
                <el-tag
                  v-else-if="item.stock_quantity < 1"
                  type="warning"
                  size="small"
                >
                  Out of stock
                </el-tag>
                <el-tag
                  v-else-if="item.quantity > item.stock_quantity"
                  type="warning"
                  size="small"
                >
                  Only {{ item.stock_quantity }} in stock
                </el-tag>
              </div>

              <div class="item-controls">
                <el-input-number
                  :model-value="item.quantity"
                  :min="1"
                  :max="Math.max(item.stock_quantity, 1)"
                  :disabled="
                    !isBookAvailable(item) ||
                    item.stock_quantity < 1 ||
                    updatingBookId === item.book_id
                  "
                  controls-position="right"
                  size="small"
                  aria-label="Item quantity"
                  @change="(quantity: number | undefined) => updateQuantity(item, quantity)"
                />
                <strong class="item-subtotal">
                  ${{ (item.price * item.quantity).toFixed(2) }}
                </strong>
                <el-button
                  link
                  type="danger"
                  :loading="removingBookId === item.book_id"
                  @click="removeItem(item)"
                >
                  Remove
                </el-button>
              </div>
            </article>
          </section>

          <aside class="cart-summary">
            <h2>Order summary</h2>
            <div class="summary-total">
              <span>{{ totalQuantity }} {{ totalQuantity === 1 ? 'book' : 'books' }}</span>
              <strong>Total: ${{ subtotal.toFixed(2) }}</strong>
            </div>
            <el-button
              class="order-button"
              type="primary"
              size="large"
              :loading="ordering"
              :disabled="!canPlaceOrder || updatingBookId !== null || removingBookId !== null"
              @click="orderDialogVisible = true"
            >
              Order
            </el-button>
          </aside>
        </div>
      </el-card>

      <el-dialog
        v-model="orderDialogVisible"
        width="min(92vw, 480px)"
        :close-on-click-modal="false"
        :before-close="handleOrderDialogClose"
      >
        <p class="dialog-total">Order total: <strong>${{ subtotal.toFixed(2) }}</strong></p>
        <el-radio-group v-model="paymentChoice" class="payment-choices">
          <el-radio value="pay_now">
            Pay now
          </el-radio>
          <el-radio value="order_only">
            Just order
          </el-radio>
        </el-radio-group>
        <template #footer>
          <div class="dialog-footer">
            <el-button :disabled="ordering" @click="orderDialogVisible = false">Cancel</el-button>
            <el-button
              type="primary"
              :loading="ordering"
              :disabled="!canPlaceOrder"
              @click="placeOrder"
            >
              Confirm order
            </el-button>
          </div>
        </template>
      </el-dialog>
    </div>
  </main>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue';
import { RouterLink } from 'vue-router';
import { ElMessage } from 'element-plus';
import { getBook, type DashboardBookData } from '../../services/Data';
import {
  addCartItem,
  addGuestCartItem,
  createOrder,
  getCart,
  getGuestCart,
  removeCartItem,
  removeGuestCartItem,
  saveGuestCart,
  updateCartItem,
  updateGuestCartItem,
  type CartItem,
} from '../../services/cartService';
import { useUserStore } from '../../store/useUserStore';

const userStore = useUserStore();
const cartItems = ref<CartItem[]>([]);
const books = ref<DashboardBookData[]>([]);
const loading = ref(false);
const addingBook = ref(false);
const ordering = ref(false);
const error = ref('');
const orderDialogVisible = ref(false);
const paymentChoice = ref<'pay_now' | 'order_only'>('order_only');
const selectedBookId = ref<number>();
const updatingBookId = ref<number | null>(null);
const removingBookId = ref<number | null>(null);
let loadRequestId = 0;

const availableBooks = computed(() => books.value.filter((book) => book.stock_quantity > 0));
const subtotal = computed(() =>
  cartItems.value.reduce((sum, item) => sum + item.price * item.quantity, 0),
);
const totalQuantity = computed(() =>
  cartItems.value.reduce((sum, item) => sum + item.quantity, 0),
);
const canPlaceOrder = computed(() =>
  cartItems.value.length > 0 &&
  subtotal.value > 0 &&
  cartItems.value.every((item) =>
    isBookAvailable(item) &&
    item.stock_quantity > 0 &&
    item.quantity <= item.stock_quantity,
  ),
);

onMounted(() => {
  void loadCart();
});

watch(
  () => userStore.userId,
  () => {
    cartItems.value = [];
    void loadCart();
  },
);

// Load the catalog and the current user's cart, or restore the guest cart locally.
async function loadCart(): Promise<void> {
  const currentRequestId = ++loadRequestId;
  const userId = userStore.userId;

  loading.value = true;
  error.value = '';

  // Fetch catalog and user cart concurrently
  const [bookResult, cartResult] = await Promise.allSettled([
    getBook(),
    userId ? getCart() : Promise.resolve(null),
  ]);

  // Guard against out-of-order race conditions
  if (currentRequestId !== loadRequestId) return;

  // Process book catalog results
  const books = processBookCatalog(bookResult);

  // Process cart items based on authentication state
  if (userId) {
    processUserCart(cartResult);
  } else {
    processGuestCart(books);
  }

  if (currentRequestId === loadRequestId) {
    loading.value = false;
  }
}

function processBookCatalog(result: PromiseSettledResult<Awaited<ReturnType<typeof getBook>>>): DashboardBookData[] {
  if (result.status === 'fulfilled') {
    const mappedBooks = result.value.data.map((book) => ({
      ...book,
      price: Number(book.price),
      stock_quantity: Number(book.stock_quantity),
    }));
    books.value = mappedBooks;
    return mappedBooks;
  } else {
    error.value = getErrorMessage(result.reason, 'Failed to load books.');
    return [];
  }
}

function processUserCart(result: PromiseSettledResult<any>): void {
  if (result.status === 'fulfilled' && result.value) {
    cartItems.value = result.value.data.map(normalizeCartItem);
  } else if (result.status === 'rejected') {
    appendError(getErrorMessage(result.reason, 'Failed to load your account cart.'));
  }
}

function processGuestCart(latestBooks: DashboardBookData[]): void {
  try {
    const savedItems = getGuestCart();
    const booksById = new Map(latestBooks.map((book) => [book.book_id, book]));

    cartItems.value = savedItems.map((item) => {
      const currentBook = booksById.get(item.book_id);

      if (!currentBook) {
        return { ...item, stock_quantity: 0 };
      }

      return {
        book_id: currentBook.book_id,
        title: currentBook.title,
        author: currentBook.author,
        price: Number(currentBook.price),
        stock_quantity: Number(currentBook.stock_quantity),
        image_url: currentBook.image_url,
        quantity: item.quantity,
      };
    });
  } catch (cause) {
    appendError(getErrorMessage(cause, 'Failed to load your saved cart.'));
  }
}

function appendError(newMsg: string): void {
  error.value = [error.value, newMsg].filter(Boolean).join(' ');
}

// Add the selected book to the signed-in user's database cart or the guest cart.
async function addSelectedBook(): Promise<void> {
  const book = books.value.find((candidate) => candidate.book_id === selectedBookId.value);
  if (!book) return;

  const signedInUserId = userStore.userId;
  addingBook.value = true;
  try {
    if (signedInUserId) {
      const { data } = await addCartItem(book.book_id);
      if (userStore.userId !== signedInUserId) return;
      setCartItemQuantity(book, data.quantity);
    } else {
      const updatedCart = addGuestCartItem(cartItems.value, book);
      if (userStore.userId !== signedInUserId) return;
      saveGuestCart(updatedCart);
      cartItems.value = updatedCart;
    }
    selectedBookId.value = undefined;
    ElMessage.success(`${book.title} added to your cart.`);
  } catch (cause) {
    ElMessage.error(getErrorMessage(cause, 'Failed to add this book to your cart.'));
  } finally {
    addingBook.value = false;
  }
}

  // Persist the new quantity in the account cart or browser storage.
async function updateQuantity(item: CartItem, quantity: number | undefined): Promise<void> {
  if (quantity === undefined || quantity === item.quantity) return;
  const signedInUserId = userStore.userId;
  updatingBookId.value = item.book_id;
  try {
    if (signedInUserId) {
      await updateCartItem(item.book_id, quantity);
      if (userStore.userId !== signedInUserId) return;
      item.quantity = quantity;
    } else {
      const updatedCart = updateGuestCartItem(cartItems.value, item.book_id, quantity);
      if (userStore.userId !== signedInUserId) return;
      saveGuestCart(updatedCart);
      cartItems.value = updatedCart;
    }
  } catch (cause) {
    ElMessage.error(getErrorMessage(cause, 'Failed to update item quantity.'));
  } finally {
    updatingBookId.value = null;
  }
}

  // Remove the book from the active account or guest cart.
async function removeItem(item: CartItem): Promise<void> {
  const signedInUserId = userStore.userId;
  removingBookId.value = item.book_id;
  try {
    if (signedInUserId) {
      await removeCartItem(item.book_id);
      if (userStore.userId !== signedInUserId) return;
      cartItems.value = cartItems.value.filter((cartItem) => cartItem.book_id !== item.book_id);
    } else {
      const updatedCart = removeGuestCartItem(cartItems.value, item.book_id);
      if (userStore.userId !== signedInUserId) return;
      saveGuestCart(updatedCart);
      cartItems.value = updatedCart;
    }
  } catch (cause) {
    ElMessage.error(getErrorMessage(cause, 'Failed to remove this book from your cart.'));
  } finally {
    removingBookId.value = null;
  }
}

// Create a database order and clear the local guest cart only after it succeeds.
async function placeOrder(): Promise<void> {
  if (!canPlaceOrder.value || ordering.value) return;

  const signedInUserId = userStore.userId;
  ordering.value = true;
  try {
    // If the user is signed in, the server will use their account cart. Otherwise, we send the current guest cart items.
    const { data } = await createOrder(
      paymentChoice.value,
      signedInUserId
        ? undefined
        : cartItems.value.map(({ book_id, quantity }) => ({ book_id, quantity })),
    );

    if (userStore.userId !== signedInUserId) return;

    if (!signedInUserId) saveGuestCart([]);
    cartItems.value = [];
    orderDialogVisible.value = false;
    ElMessage.success(
      `Order #${data.order_id} placed. Payment status: ${data.payment_status}.`,
    );
    await loadCart();
  } catch (cause) {
    ElMessage.error(getErrorMessage(cause, 'Failed to place your order.'));
  } finally {
    ordering.value = false;
  }
}

// Prevent closing the confirmation dialog while the order request is in progress.
function handleOrderDialogClose(done: () => void): void {
  if (!ordering.value) done();
}

function isBookAvailable(item: CartItem): boolean {
  return books.value.some((book) => book.book_id === item.book_id);
}

  // Mirror the database's updated quantity in the displayed account cart.
function setCartItemQuantity(book: DashboardBookData, quantity: number): void {
  const existingItem = cartItems.value.find((item) => item.book_id === book.book_id);
  const cartItem: CartItem = {
    book_id: book.book_id,
    title: book.title,
    author: book.author,
    price: Number(book.price),
    stock_quantity: Number(book.stock_quantity),
    image_url: book.image_url,
    quantity,
  };

  if (existingItem) {
    Object.assign(existingItem, cartItem);
  } else {
    cartItems.value.push(cartItem);
  }
}

  // Convert database numeric values to numbers before rendering or calculating totals.
function normalizeCartItem(item: CartItem): CartItem {
  return {
    ...item,
    price: Number(item.price),
    stock_quantity: Number(item.stock_quantity),
    quantity: Number(item.quantity),
  };
}

  // Prefer the API's error message and use the provided fallback for unknown failures.
function getErrorMessage(cause: unknown, fallback: string): string {
  if (
    typeof cause === 'object' &&
    cause !== null &&
    'response' in cause &&
    typeof cause.response === 'object' &&
    cause.response !== null &&
    'data' in cause.response &&
    typeof cause.response.data === 'object' &&
    cause.response.data !== null &&
    'error' in cause.response.data &&
    typeof cause.response.data.error === 'string'
  ) {
    return cause.response.data.error;
  }
  return cause instanceof Error ? cause.message : fallback;
}
</script>

<style scoped>
.cart-page {
  min-height: 65vh;
  padding: 3rem 1.5rem 5rem;
  color: #29251f;
  background: #f9f6f0;
}

.cart-content {
  width: min(100%, 1120px);
  margin: 0 auto;
}

.cart-heading {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.eyebrow {
  margin: 0 0 0.5rem;
  color: #8a6747;
  font-size: 0.75rem;
  font-weight: 700;
  letter-spacing: 0.14em;
}

.cart-heading h1 {
  margin: 0;
  font-family: Georgia, 'Times New Roman', serif;
  font-size: clamp(2rem, 5vw, 2.8rem);
  font-weight: 500;
}

.cart-error {
  margin-bottom: 1rem;
}

.cart-card {
  min-height: 340px;
  border-color: #e8dfd3;
  background: #fffdfa;
}

.cart-card :deep(.el-card__body) {
  padding: 1.5rem;
}

.add-book-row {
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
  margin-bottom: 1rem;
}

.book-picker {
  width: min(100%, 360px);
}

.cart-loading {
  padding: 1.5rem 0;
}

.browse-link {
  color: #80654d;
  font-weight: 600;
}

.cart-layout {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 280px;
  align-items: start;
  gap: 1.5rem;
}

.cart-items {
  display: grid;
}

.cart-item {
  display: grid;
  grid-template-columns: 76px minmax(0, 1fr) auto;
  align-items: center;
  gap: 1rem;
  padding: 1rem 0;
  border-bottom: 1px solid #eee8df;
}

.book-image {
  display: block;
  width: 76px;
  aspect-ratio: 0.7;
  object-fit: cover;
  background: #e7e0d5;
}

.book-image-fallback {
  display: grid;
  place-items: center;
  padding: 0.5rem;
  color: #fffdfa;
  background: #6e7c75;
  text-align: center;
}

.book-image-fallback span {
  font-size: 0.6rem;
  letter-spacing: 0.12em;
}

.item-details {
  display: grid;
  justify-items: start;
  gap: 0.3rem;
  min-width: 0;
}

.item-details h2,
.item-details p {
  margin: 0;
}

.item-details h2 {
  overflow-wrap: anywhere;
  font-family: Georgia, 'Times New Roman', serif;
  font-size: 1.05rem;
  font-weight: 550;
}

.item-details p,
.item-unit-price {
  color: #71695f;
  font-size: 0.9rem;
}

.item-controls {
  display: grid;
  justify-items: end;
  gap: 0.4rem;
}

.item-subtotal {
  font-size: 0.95rem;
}

.cart-summary {
  padding: 1.25rem;
  border: 1px solid #e8dfd3;
  border-radius: 8px;
  background: #fcfaf6;
}

.cart-summary h2 {
  margin: 0 0 1rem;
  font-size: 1.1rem;
}

.summary-total {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
}

.summary-total {
  padding-top: 1rem;
  border-top: 1px solid #e8dfd3;
  font-size: 1rem;
}

.summary-total strong {
  font-size: 1.15rem;
}

.order-button {
  width: 100%;
  margin-top: 1.25rem;
}


.dialog-total {
  margin: 0 0 1rem;
  font-size: 1rem;
}

.payment-choices {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 0.75rem;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 0.5rem;
}

@media (max-width: 760px) {
  .cart-layout {
    grid-template-columns: 1fr;
  }

  .cart-summary {
    order: -1;
  }
}

@media (max-width: 520px) {
  .cart-page {
    padding: 2rem 1rem 3rem;
  }

  .cart-card :deep(.el-card__body) {
    padding: 1rem;
  }

  .cart-heading {
    align-items: flex-start;
  }

  .add-book-row {
    align-items: stretch;
  }

  .book-picker {
    flex: 1;
    min-width: 0;
  }

  .cart-item {
    grid-template-columns: 58px minmax(0, 1fr) auto;
    gap: 0.65rem;
  }

  .book-image {
    width: 58px;
  }

  .item-details h2 {
    font-size: 0.95rem;
  }

  .item-controls :deep(.el-input-number) {
    width: 90px;
  }
}
</style>
