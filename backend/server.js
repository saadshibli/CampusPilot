import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import cron from 'node-cron';

// Import routes
import authRoutes from './routes/auth.js';
import userRoutes from './routes/users.js';
import classRoutes from './routes/classes.js';
import eventRoutes from './routes/events.js';
import noticeRoutes from './routes/notices.js';
import deadlineRoutes from './routes/deadlines.js';
import reminderRoutes from './routes/reminders.js';

// Import middleware
import { authenticateToken } from './middleware/auth.js';

// Import services
import { sendReminders } from './services/reminderService.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Database connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/campus-copilot')
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', authenticateToken, userRoutes);
app.use('/api/classes', authenticateToken, classRoutes);
app.use('/api/events', authenticateToken, eventRoutes);
app.use('/api/notices', authenticateToken, noticeRoutes);
app.use('/api/deadlines', authenticateToken, deadlineRoutes);
app.use('/api/reminders', authenticateToken, reminderRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Campus Copilot API is running',
    timestamp: new Date().toISOString()
  });
});

// Schedule daily reminder checks (runs every hour)
cron.schedule('0 * * * *', async () => {
  try {
    await sendReminders();
    console.log('Reminder check completed at:', new Date().toISOString());
  } catch (error) {
    console.error('Error in scheduled reminder check:', error);
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    error: 'Something went wrong!',
    message: err.message 
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

app.listen(PORT, () => {
  console.log(`🚀 Campus Copilot Server running on port ${PORT}`);
  console.log(`📚 Your Personal College Assistant API is ready!`);
}); 