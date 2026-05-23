import { Router, Response } from 'express';
import { DbManager } from '../db/db';
import { IAuthRequest, authMiddleware } from '../middleware/auth.middleware';
import { refreshAnalytics } from '../services/sync.service';

const router = Router();

// GET USER ANALYTICS DATA
router.get('/', authMiddleware, async (req: IAuthRequest, res: Response) => {
  const userId = req.user?.id;
  try {
    let analytics = await DbManager.analytics.findOne({ userId: userId || '' });
    
    // Auto-create defaults if it doesn't exist yet
    if (!analytics) {
      analytics = await refreshAnalytics(userId || '');
    }
    
    res.status(200).json(analytics);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// TRIGGER ANALYTICS RECALCULATION
router.post('/refresh', authMiddleware, async (req: IAuthRequest, res: Response) => {
  const userId = req.user?.id;
  try {
    const analytics = await refreshAnalytics(userId || '');
    res.status(200).json(analytics);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
