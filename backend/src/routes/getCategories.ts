import { Router, Request, Response } from 'express';
import pool from '../config/db';
import { requireAdmin, requireAuth } from '../controllers/requireAuth';
const router = Router();

router.get('/getCategories', requireAuth, requireAdmin, async (_req: Request, res: Response) => {
  try {
    const result = await pool.query(`
      SELECT name
      FROM categories
      ORDER BY name;
    `);

    res.json(result.rows.map((row: { name: string }) => row.name));
  } catch (error) {
    console.error(error);

    res.status(500).json({
      error: 'Failed to fetch categories',
    });
  }
});

export default router;
