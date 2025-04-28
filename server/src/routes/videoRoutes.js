/**
 * Video Routes Module
 *
 * Defines all API routes related to video operations.
 * This includes retrieving videos with pagination and searching videos.
 *
 * @module routes/videoRoutes
 */

const express = require('express');
const { getVideos, searchVideos } = require('../controllers/videoController');

/**
 * Express router to mount video related functions on.
 * @type {object}
 * @const
 */
const router = express.Router();

/**
 * Route to get all videos with pagination and optional filtering
 *
 * @name GET /api/videos
 * @function
 * @param {string} [page=1] - Page number for pagination
 * @param {string} [limit=10] - Number of videos per page
 * @param {string} [sortBy=publishedAt] - Field to sort by
 * @param {string} [sortOrder=desc] - Sort order (asc or desc)
 * @param {string} [channelTitle] - Filter by channel title
 * @param {string} [dateFrom] - Filter by date from
 * @param {string} [dateTo] - Filter by date to
 * @param {string} [title] - Filter by video title
 * @returns {Object} JSON response with videos and pagination metadata
 */
router.get('/', getVideos);

/**
 * Route to search videos by title and description
 *
 * @name GET /api/videos/search
 * @function
 * @param {string} q - Search query term
 * @param {string} [page=1] - Page number for pagination
 * @param {string} [limit=10] - Number of videos per page
 * @returns {Object} JSON response with search results and pagination metadata
 */
router.get('/search', searchVideos);

module.exports = router;
