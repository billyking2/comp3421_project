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
    stock_quantity,
    description
)
VALUES
(1, 'Clean Code', 'Robert C. Martin', 328.00, 25, 'Even bad code can function. But if code isn’t clean, it can bring a development organization to its knees. Every year, countless hours and significant resources are lost because of poorly written code. But it doesn’t have to be that way.'),
(2, 'The Pragmatic Programmer', 'Andrew Hunt', 358.00, 18 , 'This new edition examines the core of modern software development—understanding what is wanted and producing working, maintainable code that delights its users. It covers topics ranging from personal responsibility and career development to architectural techniques for keeping your code flexible and easy to adapt and reuse.'),
(3, 'Design Patterns', 'Erich Gamma', 420.00, 12, 'The authors begin by describing what patterns are and how they can help you design object-oriented software. They then go on to systematically name, explain, evaluate, and catalog recurring designs in object-oriented systems. With Design Patterns as your guide, you will learn how these important patterns fit into the software development process, and how you can leverage them to solve your own design problems most efficiently.'),
(4, 'Introduction to Algorithms', 'Thomas H. Cormen', 688.00, 10, 'Introduction to Algorithms uniquely combines rigor and comprehensiveness. It covers a broad range of algorithms in depth, yet makes their design and analysis accessible to all levels of readers, with self-contained chapters and algorithms in pseudocode.'),

(5, 'Atomic Habits', 'James Clear', 188.00, 30, 'No matter your goals, Atomic Habits offers a proven framework for improving--every day. James Clear, one of the world''s leading experts on habit formation, reveals practical strategies that will teach you exactly how to form good habits, break bad ones, and master the tiny behaviors that lead to remarkable results.'),
(6, 'Rich Dad Poor Dad', 'Robert Kiyosaki', 128.00, 22, 'Rich Dad Poor Dad is more than a book. It is the foundation of an entire financial education movement. Celebrating 25 years as the number one personal finance book of all time, according to Rich Dad, this worldwide bestseller by Robert Kiyosaki has changed the way millions of people think about money. Its premise is deceptively simple: the way you were taught to think about work, money and security may be the very thing keeping you from financial freedom.'),
(7, 'The Lean Startup', 'Eric Ries', 198.00, 15, 'Most startups fail. But many of those failures are preventable. The Lean Startup is a new approach being adopted across the globe, changing the way companies are built and new products are launched.'),

(8, 'Harry Potter and the Philosopher''s Stone', 'J.K. Rowling', 138.00, 35, 'Loved by millions of readers worldwide, let the first story in the greatest children''s book series of all time take you on an unforgettable journey. The hope and wonder of Harry Potter''s world will make you want to escape to Hogwarts again and again. The magic starts here!'),
(9, 'The Hobbit', 'J.R.R. Tolkien', 158.00, 20, 'The Hobbit is the unforgettable story of Bilbo, a peace-loving hobbit, who embarks on a strange and magical adventure.'),
(10, 'To Kill a Mockingbird', 'Harper Lee', 125.00, 16, 'Shoot all the bluejays you want, if you can hit ''em, but remember it''s a sin to kill a mockingbird.''A lawyer''s advice to his children as he defends the real mockingbird of Harper Lee''s classic novel - a black man charged with a serious crime.'),

(11, 'A Brief History of Time', 'Stephen Hawking', 168.00, 14, 'Published more than two decades ago to great critical acclaim and commercial success, A Brief History of Time has become a landmark volume in science writing. Stephen Hawking, one of the great minds of our time, explores such profound questions as: How did the universe begin—and what made its start possible? Does time always flow forward? Is the universe unending—or are there boundaries? Are there other dimensions in space? What will happen when it all ends?'),
(12, 'The Selfish Gene', 'Richard Dawkins', 178.00, 12, '"The Selfish Gene" caused a wave of excitement among biologists and the general public when it was first published in 1976. Its vivid rendering of a gene''s eye view of life, in lucid prose, gathered together the strands of thought about the nature of natural selection into a conceptual framework with far-reaching implications for our understanding of evolution. Time has confirmed its significance. Intellectually rigorous, yet written in non-technical language, "The Selfish Gene" is widely regarded as a masterpiece of science writing, and its insights remain as relevant today as on the day it was published.'),
(13, 'Cosmos', 'Carl Sagan', 198.00, 11, 'The best-selling science book ever published in the English language, COSMOS is a magnificent overview of the past, present, and future of science. Brilliant and provocative, it traces today''s knowledge and scientific methods to their historical roots, blending science and philosophy in a wholly energetic and irresistible way.'),

(14, 'Sapiens', 'Yuval Noah Harari', 208.00, 28, 'From a renowned historian comes a groundbreaking narrative of humanity’s creation and evolution—a #1 international bestseller—that explores the ways in which biology and history have defined us and enhanced our understanding of what it means to be “human.” One hundred thousand years ago, at least six different species of humans inhabited Earth. Yet today there is only one—homo sapiens. What happened to the others? And what may happen to us?'),
(15, 'The Diary of a Young Girl', 'Anne Frank', 118.00, 17, 'Discovered in the attic where she spnt the last years of her life, Anne Frank’s remarkable diary has become a world classic—a powerful reminder of the horrors of war and an eloquent testament to the human spirit.'),
(16, 'Guns, Germs, and Steel', 'Jared Diamond', 228.00, 13, 'Jared Diamond convincingly argues that geographical and environmental factors shaped the modern world. Societies that had a head start in food production advanced beyond the hunter-gatherer stage, and then developed writing, technology, government, and organized religion—as well as nasty germs and potent weapons of war—and adventured on sea and land to conquer and decimate preliterate cultures.'),

(17, 'Charlotte''s Web', 'E. B. White', 88.00, 24, 'Some Pig. Humble. Radiant. These are the words in Charlotte''s Web, high up in Zuckerman''s barn. Charlotte''s spiderweb tells of her feelings for a little pig named Wilbur, who simply wants a friend. They also express the love of a girl named Fern, who saved Wilbur''s life when he was born the runt of his litter.'),
(18, 'The Little Prince', 'Antoine de Saint-Exupery', 98.00, 26, 'A pilot forced to land in the Sahara meets a little prince. The wise and enchanting stories the prince tells of his own planet with its three volcanoes and a haughty flower are unforgettable. A strange and wonderful parable for all ages, with super illustrations by the author.'),
(19, 'Matilda', 'Roald Dahl', 108.00, 19, 'Matilda is a little girl who is far too good to be true. At age five-and-a-half she''s knocking off double-digit multiplication problems and blitz-reading Dickens. Even more remarkably, her classmates love her even though she''s a super-nerd and the teacher''s pet. But everything is not perfect in Matilda''s world...'),
(20, 'Charlie and the Chocolate Factory', 'Roald Dahl', 102.00, 21, 'Charlie Bucket''s wonderful adventure begins when he finds one of Mr. Willy Wonka''s precious Golden Tickets and wins a whole day inside the mysterious chocolate factory. Little does he know the surprises that are in store for him!'),

(21,'三體', '劉慈欣', 98.00, 50, '人類不斷向宇宙發出訊號，但我們不知道，宇宙鄰居會如何回應……天才科學家接二連三自殺，線索指向一個名叫「三體」的連線遊戲。「三體」是天體物理學的一個永恆問題，三顆質量、初始位置和速度都是任意的天體，在相互之間萬有引力的作用下，是否存在運轉的定律？如果這三個天體是三顆太陽，地球夾在中間，又會是什麼樣的世界？
This book is a science fiction classic created by Liu Cixin, which tells the story of the crisis and conflict caused by the first contact between human civilization and the Trisolaran civilization.'),
(22,'活著', '余華', 78.00, 40, '炊煙在農舍的屋頂裊裊升起，在霞光四射的空中分散後消隱了。慢慢地，田野趨向了寧靜，四周出現了模糊，霞光逐漸退去。我知道黃昏正在轉瞬即逝，黑夜從天而降了。我看到廣闊的土地袒露著結實的胸膛，那是召喚的姿態，就像女人召喚她們的兒女，土地召喚著黑夜來臨。
《活著》，敍述了平凡人的大悲大喜，而終究都回歸了大地。
這無比動人的故事，將會震撼你的心靈。
《活著》，不管是屈辱還是風光；
《活著》，不管是甜蜜還是酸楚；
《活著》，不管願不願意，喜不喜歡，都得活著……

This book spans Fugui''s life, marked by his fall from grace, and depicts the survival and perseverance of ordinary people amidst the torrent of history.
'),
(23,'解憂雜貨店', '東野圭吾', 88.00, 35, '當他們紛紛寫信到雜貨店，不可思議的事情也接二連三發生。愛情與夢想、理想與現實、人情與義理，那些一瞬間的交會，要如何演變成一生一世的救贖？跨越三十年時空，雜貨店恆常散放著溫暖奇異的光芒……
It tells a heartwarming story of a mysterious general store that answers people''s life dilemmas through a book of letters.'),
(24,'射鵰英雄傳', '金庸', 120.00, 25, '《射雕英雄傳》是講述南宋末年，外族金兵入侵。在江南牛家莊隱居的愛國義士郭嘯天之子郭靖父親被害，與母親李萍相依為命，之後闖蕩中原，與各路江湖武林高手之間因緣巧合的遭遇與恩怨情仇。
It is one of Jin Yong''s representative works, depicting Guo Jing''s growth and the magnificent world of martial arts.'),
(25,'Q版特工 x 嘉薰醫生：真生再見', ' 梁科慶,陳嘉薰', 108.00, 30, '一個外貌酷似「真生」的神祕女孩突然出現，令主角阿Wing感到極度震驚並拼命追尋，而 R 亦誓要將事件查個水落石出；此作被形容為足以扭轉阿Wing、R以及嘉薰醫生命運的關鍵篇章。
Combining reasoning, adventure, and medical knowledge, the content is vivid and interesting.'),

(26,'持續買進', 'Nick Maggiulli,李芳齡 (Translator)',67.00,27, '很多人想開始投資時，第一個遇到的問題就是「缺乏做功課的時間」。要擠出時間看盤不容易，抄底低點也是可遇不可求。與其和時間的有限性對抗，不如利用時間的複利來幫自己創造高報酬。
This book explores long-term investment and asset allocation strategies to help readers develop sound financial habits.');

-- Cover images are served from frontend/public/images.
INSERT INTO book_images (book_id, image_url, is_primary)
VALUES
(1, '/images/1-primary.webp', TRUE),
(2, '/images/2-primary.jpg', TRUE),
(3, '/images/3-primary.webp', TRUE),
(4, '/images/4-primary.jpg', TRUE),
(5, '/images/5-primary.webp', TRUE),
(6, '/images/6-primary.webp', TRUE),
(7, '/images/7-primary.webp', TRUE),
(8, '/images/8-primary.jpg', TRUE),
(9, '/images/9-primary.webp', TRUE),
(10, '/images/10-primary.jpg', TRUE),
(11, '/images/11-primary.webp', TRUE),
(12, '/images/12-primary.jpg', TRUE),
(13, '/images/13-primary.jpg', TRUE),
(14, '/images/14-primary.jpg', TRUE),
(15, '/images/15-primary.jpg', TRUE),
(16, '/images/16-primary.jpg', TRUE),
(17, '/images/17-primary.jpg', TRUE),
(18, '/images/18-primary.jpg', TRUE),
(19, '/images/19-primary.jpg', TRUE),
(20, '/images/20-primary.jpg', TRUE),
(21, '/images/21-primary.jpg', TRUE),
(22, '/images/22-primary.jpg', TRUE),
(23, '/images/23-primary.jpg', TRUE),
(24, '/images/24-primary.jpg', TRUE),
(25, '/images/25-primary.jpg', TRUE),
(26, '/images/26-primary.jpg', TRUE);

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
(20, 8),

-- 三體
(21, 2),
(21, 3),

-- 活著
(22, 2),
(22, 3),

-- 解憂雜貨店
(23, 2),
(23, 3),

-- 射鵰英雄傳
(24, 2),
(24, 3),

-- Q版特工 x 嘉薰醫生：真生再見
(25, 2),
(25, 3),

-- 持續買進
(26, 1),
(26, 6);

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

-- Keep sequences in sync after inserting explicit IDs into SERIAL columns.
SELECT setval(
    pg_get_serial_sequence('users', 'user_id'),
    COALESCE(MAX(user_id), 0) + 1,
    false
) FROM users;

SELECT setval(
    pg_get_serial_sequence('categories', 'category_id'),
    COALESCE(MAX(category_id), 0) + 1,
    false
) FROM categories;

SELECT setval(
    pg_get_serial_sequence('books', 'book_id'),
    COALESCE(MAX(book_id), 0) + 1,
    false
) FROM books;

SELECT setval(
    pg_get_serial_sequence('cart_items', 'cart_item_id'),
    COALESCE(MAX(cart_item_id), 0) + 1,
    false
) FROM cart_items;

SELECT setval(
    pg_get_serial_sequence('orders', 'order_id'),
    COALESCE(MAX(order_id), 0) + 1,
    false
) FROM orders;

SELECT setval(
    pg_get_serial_sequence('order_items', 'order_item_id'),
    COALESCE(MAX(order_item_id), 0) + 1,
    false
) FROM order_items;