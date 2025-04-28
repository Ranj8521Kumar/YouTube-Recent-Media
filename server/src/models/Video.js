const mongoose = require('mongoose');

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

// Create text index for search functionality
videoSchema.index({ title: 'text', description: 'text' });

const Video = mongoose.model('Video', videoSchema);

module.exports = Video;
