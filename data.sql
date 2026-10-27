INSERT INTO users (
    user_id,
    username,
    email,
    password_hash,
    role,
    created_at
)
VALUES
(
    1,
    'admin',
    'admin_user@example.com',
    '$2b$10$Mhr7rq3PUlmbUrpoIRKCeum0q.KOA63QmV9cmgw6BsUOmrN8b/.ze',
    'admin',
    '2026-10-25 23:54:35.810674'
),
(
    2,
    'alice',
    'alice@gmail.com',
    '$2b$10$d.13DJ2nkb5Xs9tDWKD5seurbGN026mewR87eR4VMnZ37Y4nmC6CO',
    'customer',
    '2026-10-28 00:30:19.28827'
),
(
    3,
    'bob',
    'bob@gmail.com',
    '$2b$10$hGi6PSXnxo64qpoDycE8O.Bl5BygyQCm3Q7iMnrDMLrW4J7SiBqZW',
    'customer',
    '2026-10-28 00:30:27.080036'
),
(
    4,
    'charlie',
    'charlie@gmail.com',
    '$2b$10$ufJcahAev5ISD6rcGdV8XOTpB.08Lc6u.jqk0/wKtHL3WSI5wLncG',
    'customer',
    '2026-10-28 00:30:32.282363'
),
(
    5,
    'david',
    'david@gmail.com',
    '$2b$10$jgP2d5YyPj8F4eRcCAb/je.cqrd0UAVICvZUyXXwZwDJZOMIDanxG',
    'customer',
    '2026-10-28 00:30:36.687605'
);


INSERT INTO categories (
    category_id,
    name,
    description
)
VALUES
(
    1,
    'English',
    'Books written in English'
),
(
    2,
    'Chinese',
    'Books written in Chinese'
),
(
    3,
    'Fiction',
    'Novels and literary works'
),
(
    4,
    'Science',
    'Science and technology books'
),
(
    5,
    'Programming',
    'Software development and computer science books'
),
(
    6,
    'Business',
    'Business, finance, and management books'
),
(
    7,
    'History',
    'History and biography books'
),
(
    8,
    'Children',
    'Books for children and young readers'
);

INSERT INTO books (
    book_id,
    title,
    author,
    price,
    stock_quantity
)
VALUES
(1, 'Clean Code', 'Robert C. Martin', 328.00, 25),
(2, 'The Pragmatic Programmer', 'Andrew Hunt', 358.00, 18),
(3, 'Design Patterns', 'Erich Gamma', 420.00, 12),
(4, 'Introduction to Algorithms', 'Thomas H. Cormen', 688.00, 10),

(5, 'Atomic Habits', 'James Clear', 188.00, 30),
(6, 'Rich Dad Poor Dad', 'Robert Kiyosaki', 128.00, 22),
(7, 'The Lean Startup', 'Eric Ries', 198.00, 15),

(8, 'Harry Potter and the Philosopher''s Stone', 'J.K. Rowling', 138.00, 35),
(9, 'The Hobbit', 'J.R.R. Tolkien', 158.00, 20),
(10, 'To Kill a Mockingbird', 'Harper Lee', 125.00, 16),

(11, 'A Brief History of Time', 'Stephen Hawking', 168.00, 14),
(12, 'The Selfish Gene', 'Richard Dawkins', 178.00, 12),
(13, 'Cosmos', 'Carl Sagan', 198.00, 11),

(14, 'Sapiens', 'Yuval Noah Harari', 208.00, 28),
(15, 'The Diary of a Young Girl', 'Anne Frank', 118.00, 17),
(16, 'Guns, Germs, and Steel', 'Jared Diamond', 228.00, 13),

(17, 'Charlotte''s Web', 'E. B. White', 88.00, 24),
(18, 'The Little Prince', 'Antoine de Saint-Exupery', 98.00, 26),
(19, 'Matilda', 'Roald Dahl', 108.00, 19),
(20, 'Charlie and the Chocolate Factory', 'Roald Dahl', 102.00, 21);

INSERT INTO book_categories (book_id, category_id)
VALUES

-- Clean Code
(1, 1),
(1, 5),

-- The Pragmatic Programmer
(2, 1),
(2, 5),

-- Design Patterns
(3, 1),
(3, 5),

-- Introduction to Algorithms
(4, 1),
(4, 5),

-- Atomic Habits
(5, 1),
(5, 6),

-- Rich Dad Poor Dad
(6, 1),
(6, 6),

-- The Lean Startup
(7, 1),
(7, 6),

-- Harry Potter
(8, 1),
(8, 3),
(8, 8),

-- The Hobbit
(9, 1),
(9, 3),

-- To Kill a Mockingbird
(10, 1),
(10, 3),

-- A Brief History of Time
(11, 1),
(11, 4),

-- The Selfish Gene
(12, 1),
(12, 4),

-- Cosmos
(13, 1),
(13, 4),

-- Sapiens
(14, 1),
(14, 7),

-- The Diary of a Young Girl
(15, 1),
(15, 7),

-- Guns, Germs, and Steel
(16, 1),
(16, 7),

-- Charlotte's Web
(17, 1),
(17, 3),
(17, 8),

-- The Little Prince
(18, 1),
(18, 3),
(18, 8),

-- Matilda
(19, 1),
(19, 3),
(19, 8),

-- Charlie and the Chocolate Factory
(20, 1),
(20, 3),
(20, 8);

INSERT INTO cart_items (
    cart_item_id,
    user_id,
    book_id,
    quantity
)
VALUES
-- Alice
(1, 2, 1, 1),   -- Clean Code
(2, 2, 5, 2),   -- Atomic Habits

-- Bob
(3, 3, 8, 1),   -- Harry Potter
(4, 3, 14, 1),  -- Sapiens

-- Charlie
(5, 4, 2, 1),   -- The Pragmatic Programmer
(6, 4, 11, 1),  -- A Brief History of Time
(7, 4, 18, 1),  -- The Little Prince

-- David
(8, 5, 6, 1),   -- Rich Dad Poor Dad
(9, 5, 19, 2);  -- Matilda


INSERT INTO orders (
    order_id,
    user_id,
    total_amount,
    payment_status,
    created_at
)
VALUES
(
    1,
    2,
    704.00,
    'paid',
    '2026-10-27 10:30:00'
),
(
    2,
    3,
    296.00,
    'paid',
    '2026-10-27 14:15:00'
),
(
    3,
    4,
    624.00,
    'paid',
    '2026-10-27 17:45:00'
),
(
    4,
    5,
    344.00,
    'not paid',
    '2026-10-27 20:10:00'
);

INSERT INTO order_items (
    order_item_id,
    order_id,
    book_id,
    quantity,
    unit_price
)
VALUES

-- Order 1 (Alice)
(1, 1, 1, 1, 328.00),
(2, 1, 5, 2, 188.00),

-- Order 2 (Bob)
(3, 2, 8, 1, 138.00),
(4, 2, 14, 1, 158.00),

-- Order 3 (Charlie)
(5, 3, 2, 1, 358.00),
(6, 3, 11, 1, 168.00),
(7, 3, 18, 1, 98.00),

-- Order 4 (David)
(8, 4, 6, 1, 128.00),
(9, 4, 19, 2, 108.00);