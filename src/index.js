const express = require('express');
const cors = require('cors');
const cron = require('node-cron');
const connectDB = require('./config/db');
const videoRoutes = require('./routes/videoRoutes');
const { fetchAndSaveVideos } = require('./services/youtubeService');
require('dotenv').config();

// Initialize Express app
const app = express();

// Connect to MongoDB
connectDB();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/videos', videoRoutes);

// Health check route
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

// Set up cron job to fetch videos periodically
const fetchIntervalSeconds = Math.floor(parseInt(process.env.FETCH_INTERVAL) / 1000) || 10;
const cronExpression = `*/${fetchIntervalSeconds} * * * * *`; // Run every X seconds

cron.schedule(cronExpression, async () => {
  try {
    await fetchAndSaveVideos();
  } catch (error) {
    console.error('Error in cron job:', error.message);
  }
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  
  // Initial fetch of videos
  fetchAndSaveVideos().catch(error => {
    console.error('Error in initial video fetch:', error.message);
  });
});
