import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export interface IAuthRequest extends Request {
  user?: {
    id: string;
    email: string;
  };
}

export const authMiddleware = (req: IAuthRequest, res: Response, next: NextFunction) => {
  // Support mock bypass for instant developer evaluation
  const bypassHeader = req.headers['x-mock-bypass'];
  if (bypassHeader === 'true' || process.env.BYPASS_AUTH === 'true') {
    req.user = {
      id: 'mock_user_pragyan',
      email: 'pragyan@siftmail.ai'
    };
    return next();
  }

  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Access denied. No security token provided.' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const jwtSecret = process.env.JWT_SECRET || 'siftmail_secret_glow_key_99';
    const decoded = jwt.verify(token, jwtSecret) as { id: string; email: string };
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Invalid or expired authorization token.' });
  }
};
