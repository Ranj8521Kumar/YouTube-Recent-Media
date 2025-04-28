/**
 * Main application entry point for YouTube API server
 *
 * This file initializes the Express server, connects to MongoDB,
 * sets up middleware, defines routes, and configures the cron job
 * to periodically fetch videos from YouTube API.
 *
 * @module index
 */

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

/**
 * Health check endpoint
 *
 * Simple route that returns a 200 OK response to indicate
 * that the server is running properly. Used for monitoring
 * and container health checks.
 */
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

/**
 * Cron job configuration to fetch videos periodically
 *
 * Sets up a scheduled task to fetch new videos from YouTube API
 * at regular intervals defined by the FETCH_INTERVAL environment variable.
 * Default interval is 10 seconds if not specified.
 */
const fetchIntervalSeconds = Math.floor(parseInt(process.env.FETCH_INTERVAL) / 1000) || 10;
const cronExpression = `*/${fetchIntervalSeconds} * * * * *`; // Run every X seconds

cron.schedule(cronExpression, async () => {
  try {
    await fetchAndSaveVideos();
  } catch (error) {
    console.error('Error in cron job:', error.message);
  }
});

/**
 * Server initialization
 *
 * Starts the Express server on the specified port (default: 3000)
 * and performs an initial fetch of videos from YouTube API.
 */
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);

  // Initial fetch of videos on server startup
  fetchAndSaveVideos().catch(error => {
    console.error('Error in initial video fetch:', error.message);
  });
});
