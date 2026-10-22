const express = require('express');
const pool = require('./db');

const app = express();
app.use(express.json());


app.get('/api/test-db', async (req, res) => {
  try {
    const result = await pool.query('SELECT NOW()');
    res.json({ success: true, time: result.rows[0] });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('connection error');
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`workong on ：http://localhost:${PORT}`);
});