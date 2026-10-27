import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import routersEntry from './routes';
import pool from './config/db';
import cookieParser from 'cookie-parser';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cookieParser());

app.use(
  cors({
    origin: process.env.CLIENT_URL,
    credentials: true,
  })
);
app.use(express.json());

app.get('/api/health', async (req, res) => {
  try {
    const result = await pool.query('SELECT NOW()');
    res.json({ 
      message: 'Backend server and PostgreSQL are connected!', 
      time: result.rows[0].now 
    });
  } catch (err: any) {
    res.status(500).json({ error: 'Database connection failed', details: err.message });
  }
});


app.use('/api', routersEntry);

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});