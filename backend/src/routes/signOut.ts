import { Router } from 'express';

const router = Router();

router.post('/signOut', (req, res) => {
  try {
    res.clearCookie('token', {
      httpOnly: true,
      secure: process.env.COOKIE_SECURE === 'true',
      sameSite: 'lax',
      path: '/',
    });

    res.json({
      success: true,
      message: 'Signed out successfully',
    });
  } catch (err: unknown) {
    if (err instanceof Error) {
    console.error('SignOut error:', err.message);
  } else {
    console.error('SignOut error:', err);
  }
  
    res.status(500).json({ error: 'Server error during SignOut' });
  }
});

export default router;
