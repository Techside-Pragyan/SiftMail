import { Router, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { DbManager } from '../db/db';
import { IAuthRequest, authMiddleware } from '../middleware/auth.middleware';
import { prePopulateInbox, startSimulationStream } from '../services/sync.service';

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || 'siftmail_secret_glow_key_99';

// ==========================================
// 1. REGISTER
// ==========================================
router.post('/register', async (req: any, res: Response) => {
  const { email, password, name } = req.body;

  if (!email || !password || !name) {
    return res.status(400).json({ error: 'Missing registration details.' });
  }

  try {
    const existingUser = await DbManager.users.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'Email address already registered.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await DbManager.users.create({
      email,
      password: hashedPassword,
      name,
      preferences: {
        theme: 'dark',
        language: 'English',
        autoResponderEnabled: false,
        autoResponderTemplate: 'Hi, thank you for your email. SiftMail AI has received your message and we are reviewing it. We will get back to you shortly.',
        notificationsEnabled: true
      }
    });

    // Populate standard workspace emails and start real-time sync immediately!
    const userId = newUser._id || newUser.id || '';
    await prePopulateInbox(userId);
    startSimulationStream(userId);

    const token = jwt.sign({ id: userId, email: newUser.email }, JWT_SECRET, { expiresIn: '7d' });
    res.status(201).json({
      token,
      user: {
        id: userId,
        email: newUser.email,
        name: newUser.name,
        preferences: newUser.preferences
      }
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ==========================================
// 2. LOGIN
// ==========================================
router.post('/login', async (req: any, res: Response) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Missing email or password.' });
  }

  try {
    // Provide a direct mock bypass login for testing ease
    if (email === 'demo@siftmail.ai' && password === 'demo123') {
      let mockUser = await DbManager.users.findOne({ email: 'demo@siftmail.ai' });
      if (!mockUser) {
        mockUser = await DbManager.users.create({
          email: 'demo@siftmail.ai',
          name: 'Demo Sorter',
          preferences: {
            theme: 'dark',
            language: 'English',
            autoResponderEnabled: false,
            autoResponderTemplate: 'Thanks for reaching out! This is an AI Auto-Responder.',
            notificationsEnabled: true
          }
        });
        const userId = mockUser._id || mockUser.id || '';
        await prePopulateInbox(userId);
      }

      const userId = mockUser._id || mockUser.id || '';
      startSimulationStream(userId);

      const token = jwt.sign({ id: userId, email: mockUser.email }, JWT_SECRET, { expiresIn: '7d' });
      return res.status(200).json({
        token,
        user: {
          id: userId,
          email: mockUser.email,
          name: mockUser.name,
          preferences: mockUser.preferences
        }
      });
    }

    const user = await DbManager.users.findOne({ email });
    if (!user || !user.password) {
      return res.status(400).json({ error: 'Invalid login credentials.' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ error: 'Invalid login credentials.' });
    }

    const userId = user._id || user.id || '';
    startSimulationStream(userId);

    const token = jwt.sign({ id: userId, email: user.email }, JWT_SECRET, { expiresIn: '7d' });
    res.status(200).json({
      token,
      user: {
        id: userId,
        email: user.email,
        name: user.name,
        preferences: user.preferences
      }
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ==========================================
// 3. PROFILE & PREFERENCES
// ==========================================
router.get('/profile', authMiddleware, async (req: IAuthRequest, res: Response) => {
  const userId = req.user?.id;
  try {
    const user = await DbManager.users.findById(userId || '');
    if (!user) {
      return res.status(404).json({ error: 'User profiles not found.' });
    }
    res.status(200).json({
      id: user._id || user.id,
      email: user.email,
      name: user.name,
      preferences: user.preferences,
      emailSettings: user.emailSettings
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/preferences', authMiddleware, async (req: IAuthRequest, res: Response) => {
  const userId = req.user?.id;
  const { preferences, emailSettings } = req.body;

  try {
    const updated = await DbManager.users.findByIdAndUpdate(userId || '', {
      preferences,
      emailSettings
    });

    if (!updated) {
      return res.status(404).json({ error: 'User does not exist.' });
    }

    res.status(200).json({
      id: updated._id || updated.id,
      email: updated.email,
      name: updated.name,
      preferences: updated.preferences,
      emailSettings: updated.emailSettings
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
