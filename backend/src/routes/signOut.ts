import { Router } from 'express';

const router = Router();

router.post('/signOut', (req, res) => {
  try {
    res.clearCookie('token');

    res.json({
      success: true,
      message: 'Signed out successfully',
    });
  } catch (err: Error) {
    console.error('SignOut error:', err.message);
    res.status(500).json({ error: 'Server error during SignOut' });
  }
});

export default router;
