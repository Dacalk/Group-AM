import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { initializeDatabase, closeDatabase } from './config/db.js';
import apiRouter from './routes/api.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Routes
app.use('/api', apiRouter);

// Health Check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'LMS Backend is running.' });
});

// Start Server and initialize database pool
const server = app.listen(PORT, async () => {
  try {
    await initializeDatabase();
    console.log(`Server is running on port ${PORT}`);
  } catch (err) {
    console.error('WARNING: Server failed to connect to Oracle DB. The app will run, but database actions will fail.', err.message);
    console.log(`Server is running on port ${PORT}`);
  }
});

// Handle graceful shutdown
const gracefulShutdown = async () => {
  console.log('Received shutdown signal. Closing DB pool...');
  await closeDatabase();
  process.exit(0);
};

process.on('SIGINT', gracefulShutdown);
process.on('SIGTERM', gracefulShutdown);
