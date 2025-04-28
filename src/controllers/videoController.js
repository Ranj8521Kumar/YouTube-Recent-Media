const Video = require('../models/Video');

/**
 * Get videos with pagination
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Object} - JSON response with videos
 */
const getVideos = async (req, res) => {
  try {
    // Extract pagination parameters from query, defaulting to page 1 and 10 items per page
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Fetch videos from database with pagination
    const videos = await Video.find()
      .sort({ publishedAt: -1 }) // Sort by publish date, newest first
      .skip(skip) // Skip the specified number of items
      .limit(limit);// Limit the number of items returned

    // Get total count of videos for pagination metadata
    const totalVideos = await Video.countDocuments();
    const totalPages = Math.ceil(totalVideos / limit);

    // Construct and send the response
    return res.status(200).json({
      success: true,
      count: videos.length,
      pagination: {
        currentPage: page,
        totalPages,
        totalVideos,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
      data: videos,
    });
  } catch (error) {
    console.error('Error getting videos:', error.message);
    return res.status(500).json({
      success: false,
      error: 'Server Error',
    });
  }
};

/**
 * Search videos by title and description
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Object} - JSON response with search results
 */
const searchVideos = async (req, res) => {
  try {
    const searchTerm = req.query.q;
    
    // Validate search term
    if (!searchTerm) {
      return res.status(400).json({
        success: false,
        error: 'Search term is required',
      });
    }

    // Extract pagination parameters
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Perform text search on the database
    const videos = await Video.find(
      { $text: { $search: searchTerm } },
      { score: { $meta: 'textScore' } }
    )
      .sort({ score: { $meta: 'textScore' }, publishedAt: -1 }) // Sort by relevance and then by date
      .skip(skip)
      .limit(limit);

    // Get total count of matching videos for pagination metadata
    const totalVideos = await Video.countDocuments({ $text: { $search: searchTerm } });
    const totalPages = Math.ceil(totalVideos / limit);

    // Construct and send the response
    return res.status(200).json({
      success: true,
      count: videos.length,
      pagination: {
        currentPage: page,
        totalPages,
        totalVideos,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
      data: videos,
    });
  } catch (error) {
    console.error('Error searching videos:', error.message);
    return res.status(500).json({
      success: false,
      error: 'Server Error',
    });
  }
};

module.exports = {
  getVideos,
  searchVideos,
};
