import { Router, Response } from 'express';
import { DbManager } from '../db/db';
import { IAuthRequest, authMiddleware } from '../middleware/auth.middleware';

const router = Router();

// 1. GET ALL TASKS
router.get('/', authMiddleware, async (req: IAuthRequest, res: Response) => {
  const userId = req.user?.id;
  try {
    const tasks = await DbManager.tasks.find({ userId });
    res.status(200).json(tasks);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 2. CREATE MANUAL TASK
router.post('/', authMiddleware, async (req: IAuthRequest, res: Response) => {
  const userId = req.user?.id;
  const { text, dueDate, emailId } = req.body;

  if (!text) {
    return res.status(400).json({ error: 'Task text is required.' });
  }

  try {
    const task = await DbManager.tasks.create({
      userId: userId || '',
      emailId: emailId || 'manual',
      text,
      dueDate: dueDate ? new Date(dueDate) : undefined,
      completed: false
    });
    res.status(201).json(task);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 3. UPDATE TASK COMPLETION
router.put('/:id', authMiddleware, async (req: IAuthRequest, res: Response) => {
  const { id } = req.params;
  const { completed, text, dueDate } = req.body;

  try {
    const update: any = {};
    if (completed !== undefined) update.completed = completed;
    if (text !== undefined) update.text = text;
    if (dueDate !== undefined) update.dueDate = dueDate ? new Date(dueDate) : null;

    const task = await DbManager.tasks.findByIdAndUpdate(id, update);
    if (!task) {
      return res.status(404).json({ error: 'Task item not found.' });
    }
    res.status(200).json(task);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
