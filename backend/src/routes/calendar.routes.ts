import { Router, Response } from 'express';
import { DbManager } from '../db/db';
import { IAuthRequest, authMiddleware } from '../middleware/auth.middleware';

const router = Router();

// GET ALL CALENDAR EVENTS
router.get('/', authMiddleware, async (req: IAuthRequest, res: Response) => {
  const userId = req.user?.id;
  try {
    const events = await DbManager.events.find({ userId });
    res.status(200).json(events);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// CREATE CALENDAR EVENT MANUALLY
router.post('/', authMiddleware, async (req: IAuthRequest, res: Response) => {
  const userId = req.user?.id;
  const { title, description, start, end, location, emailId } = req.body;

  if (!title || !start || !end) {
    return res.status(400).json({ error: 'Missing title, start time or end time.' });
  }

  try {
    const newEvent = await DbManager.events.create({
      userId: userId || '',
      emailId: emailId || 'manual',
      title,
      description,
      start: new Date(start),
      end: new Date(end),
      location
    });
    res.status(201).json(newEvent);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
