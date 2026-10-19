const express = require('express');
const pool = require('./db');

const app = express();
app.use(express.json());

// 測試用 API：取得資料庫當前時間
app.get('/api/test-db', async (req, res) => {
  try {
    const result = await pool.query('SELECT NOW()');
    res.json({ success: true, time: result.rows[0] });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('資料庫連線失敗');
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`後端伺服器正在執行：http://localhost:${PORT}`);
});