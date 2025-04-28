/**
 * Video Model
 *
 * Defines the schema for YouTube videos stored in the database.
 * Includes fields for video metadata and creates appropriate indexes
 * for efficient querying and text search.
 *
 * @module models/Video
 */

const mongoose = require('mongoose');

/**
 * Video Schema
 *
 * @typedef {Object} VideoSchema
 * @property {string} videoId - Unique YouTube video identifier
 * @property {string} title - Video title
 * @property {string} description - Video description
 * @property {Date} publishedAt - Date when the video was published
 * @property {Object} thumbnails - Object containing thumbnail images in different sizes
 * @property {string} channelTitle - Name of the YouTube channel
 * @property {string} channelId - YouTube channel identifier
 * @property {Date} createdAt - Automatically added by timestamps
 * @property {Date} updatedAt - Automatically added by timestamps
 */
const videoSchema = new mongoose.Schema({
  videoId: {
    type: String,
    required: true,
    unique: true,
  },
  title: {
    type: String,
    required: true,
    index: true,
  },
  description: {
    type: String,
    index: true,
  },
  publishedAt: {
    type: Date,
    required: true,
    index: true,
  },
  thumbnails: {
    default: {
      url: String,
      width: Number,
      height: Number,
    },
    medium: {
      url: String,
      width: Number,
      height: Number,
    },
    high: {
      url: String,
      width: Number,
      height: Number,
    },
  },
  channelTitle: {
    type: String,
  },
  channelId: {
    type: String,
  },
}, {
  timestamps: true,
});

/**
 * Create text index for search functionality
 *
 * This index enables efficient text search on the title and description fields,
 * which is used by the searchVideos controller function.
 */
videoSchema.index({ title: 'text', description: 'text' });

/**
 * Video model
 *
 * Mongoose model for the Video collection based on the defined schema.
 * @type {mongoose.Model}
 */
const Video = mongoose.model('Video', videoSchema);

module.exports = Video;
