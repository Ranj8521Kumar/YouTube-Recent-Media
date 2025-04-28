const express = require('express');
const { getVideos, searchVideos } = require('../controllers/videoController');

const router = express.Router();

// Get all videos with pagination
router.get('/', getVideos);

// Search videos
router.get('/search', searchVideos);

module.exports = router;
