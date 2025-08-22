import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export interface AuthUser {
  id: string;
  email: string;
  role: string;
}

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  const token = authHeader.slice('Bearer '.length);
  try {
    const secret = process.env.JWT_SECRET || '';
    const payload = jwt.verify(token, secret) as AuthUser;
    (req as any).user = payload;
    next();
  } catch {
    return res.status(401).json({ error: 'Invalid token' });
  }
}

export function signToken(user: AuthUser) {
  const secret = process.env.JWT_SECRET || '';
  return jwt.sign(user, secret, { expiresIn: '7d' });
}
