import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';

export interface AuthenticatedRequest extends Request {
  user?: jwt.JwtPayload & { userId?: string | number; role?: string };
}

export function requireAuth(req: Request, res: Response, next: NextFunction): void {
  const token = req.cookies.token;

  if (!token) {
    res.status(401).json({
      error: 'Not authenticated',
    });
    return;
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET!);
    if (typeof payload === 'string') {
      res.status(401).json({ error: 'Invalid token' });
      return;
    }

    (req as AuthenticatedRequest).user = payload;
    next();
  } catch {
    res.status(401).json({
      error: 'Invalid token',
    });
  }
}

export function requireAdmin(req: Request, res: Response, next: NextFunction): void {
  if ((req as AuthenticatedRequest).user?.role !== 'admin') {
    res.status(403).json({ error: 'Admin access required' });
    return;
  }

  next();
}
