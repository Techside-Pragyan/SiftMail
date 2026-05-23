import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import { connectDB } from './db/db';
import { initSyncEngine } from './services/sync.service';

// Import Routes
import authRouter from './routes/auth.routes';
import emailRouter from './routes/email.routes';
import taskRouter from './routes/task.routes';
import calendarRouter from './routes/calendar.routes';
import analyticsRouter from './routes/analytics.routes';
import adminRouter from './routes/admin.routes';

// Load environmental parameters
dotenv.config();

const app = express();
const server = http.createServer(app);

// Configure WebSocket Server
const io = new Server(server, {
  cors: {
    origin: '*', // open origin during local developer pairings
    methods: ['GET', 'POST', 'PUT', 'DELETE']
  }
});

// Configure base middlewares
app.use(helmet({
  contentSecurityPolicy: false // disable for local browser pairings
}));
app.use(cors());
app.use(express.json());

// Global API rate limits
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200, // limit each IP to 200 requests per windowMs
  message: 'Too many requests from this IP, please try again after 15 minutes.'
});
app.use('/api/', limiter);

// Bind API REST Routers
app.use('/api/auth', authRouter);
app.use('/api/emails', emailRouter);
app.use('/api/tasks', taskRouter);
app.use('/api/calendar', calendarRouter);
app.use('/api/analytics', analyticsRouter);
app.use('/api/admin', adminRouter);

// Health Check Endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'healthy', uptime: process.uptime() });
});

// WebSocket Server Handshake Connections
io.on('connection', (socket) => {
  console.log(`🔌 Client connected to WebSocket: ${socket.id}`);

  // Socket joins a private room mapped to the user ID
  socket.on('join_inbox', (userId: string) => {
    socket.join(userId);
    console.log(`👤 Client ${socket.id} subscribed to inbox room: ${userId}`);
  });

  socket.on('disconnect', () => {
    console.log(`🔌 Client disconnected: ${socket.id}`);
  });
});

const PORT = process.env.PORT || 5000;

// Connect to Database & Launch Server
async function startServer() {
  // Connect database with transparent fallbacks
  await connectDB();

  // Bind WebSocket instance to the Sync Engine
  initSyncEngine(io);

  server.listen(PORT, () => {
    console.log(`🚀 SiftMail AI Server running on: http://localhost:${PORT}`);
  });
}

startServer();
