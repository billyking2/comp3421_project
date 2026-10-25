const express = require('express');
const cors = require('cors');
require('dotenv').config();
const pool = require('./config/db.ts');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());


app.get('/api/health', async (req, res) => {
  try {
    const result = await pool.query('SELECT NOW()');
    res.json({ 
      message: 'Backend server and PostgreSQL are connected!', 
      time: result.rows[0].now 
    });
  } catch (err: any) {
    console.error('❌ Database connection error details:', err.message); // <-- Added this
    res.status(500).json({ error: 'Database connection failed', details: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});