/**
 * Video Controller Module
 *
 * Handles all HTTP requests related to videos, including
 * retrieving videos with pagination and filtering, and
 * searching videos by title and description.
 *
 * @module controllers/videoController
 */

const Video = require('../models/Video');

/**
 * Get videos with pagination and optional dashboard filters
 *
 * Retrieves videos from the database with support for pagination,
 * sorting, and filtering by various criteria. This endpoint powers
 * both the main video listing and the dashboard filtering functionality.
 *
 * @async
 * @function getVideos
 * @param {Object} req - Express request object
 * @param {Object} req.query - Query parameters
 * @param {number} [req.query.page=1] - Page number for pagination
 * @param {number} [req.query.limit=10] - Number of videos per page
 * @param {string} [req.query.sortBy='publishedAt'] - Field to sort by
 * @param {string} [req.query.sortOrder='desc'] - Sort order (asc or desc)
 * @param {string} [req.query.channelTitle] - Filter by channel title
 * @param {string} [req.query.dateFrom] - Filter by date from (ISO format)
 * @param {string} [req.query.dateTo] - Filter by date to (ISO format)
 * @param {string} [req.query.title] - Filter by video title
 * @param {Object} res - Express response object
 * @returns {Object} - JSON response with videos and pagination metadata
 */
const getVideos = async (req, res) => {
  try {
    // Extract pagination parameters from query, maintaining original defaults
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Extract optional dashboard filters
    const {
      sortBy = 'publishedAt',
      sortOrder = ['asc', 'desc'].includes(req.query.sortOrder?.toLowerCase()) ? req.query.sortOrder.toLowerCase() : 'desc',
      channelTitle,
      dateFrom,
      dateTo,
      title,
    } = req.query;

    // Build filter object for dashboard queries
    const filter = {};

    if (channelTitle) {
      filter.channelTitle = { $regex: channelTitle, $options: 'i' };
    }

    if (title) {
      filter.title = { $regex: title, $options: 'i' };
    }

    if (dateFrom || dateTo) {
      filter.publishedAt = {};
      if (dateFrom) {
        filter.publishedAt.$gte = new Date(dateFrom);
      }
      if (dateTo) {
        const endDate = new Date(dateTo);
        endDate.setDate(endDate.getDate() + 1);
        filter.publishedAt.$lt = endDate;
      }
    }

    // Build sort object
    const allowedSortFields = ['publishedAt', 'title', 'channelTitle'];
    const validSortBy = allowedSortFields.includes(sortBy) ? sortBy : 'publishedAt';
    const validSortOrder = sortOrder === 'asc' ? 1 : -1;
    const sort = { [validSortBy]: validSortOrder };

    // Fetch videos from database with filters, sorting, and pagination
    const videos = await Video.find(filter)
      .sort(sort)
      .skip(skip)
      .limit(limit);

    // Get total count for pagination
    const totalVideos = await Video.countDocuments(filter);
    const totalPages = Math.ceil(totalVideos / limit);

    // Construct response with both original and new dashboard metadata
    const response = {
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
    };

     // Add dashboard metadata only if dashboard filters are used
     if (channelTitle || dateFrom || dateTo || title || sortBy !== 'publishedAt' || sortOrder !== req.query.sortOrder) {
      response.dashboard = {
        filters: {
          channelTitle,
          dateFrom,
          dateTo,
          title,
        },
        sorting: {
          sortBy: validSortBy,
          sortOrder: sortOrder // Use the processed sortOrder directly
        },
      };
    }

    return res.status(200).json(response);
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
 *
 * Performs a text search on the video collection using MongoDB's
 * text index capabilities. Results are sorted by relevance score
 * and then by publish date.
 *
 * @async
 * @function searchVideos
 * @param {Object} req - Express request object
 * @param {Object} req.query - Query parameters
 * @param {string} req.query.q - Search query term
 * @param {number} [req.query.page=1] - Page number for pagination
 * @param {number} [req.query.limit=10] - Number of videos per page
 * @param {Object} res - Express response object
 * @returns {Object} - JSON response with search results and pagination metadata
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
      .sort({ score: { $meta: 'textScore' }, publishedAt: -1 })
      .skip(skip)
      .limit(limit);

    // Get total count of matching videos for pagination metadata
    const totalVideos = await Video.countDocuments({ $text: { $search: searchTerm } });
    const totalPages = Math.ceil(totalVideos / limit);

    // Return original search response structure
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

/**
 * Export controller functions
 * @type {Object}
 */
module.exports = {
  getVideos,
  searchVideos,
};