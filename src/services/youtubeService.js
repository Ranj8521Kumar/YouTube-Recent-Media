const axios = require('axios');
const Video = require('../models/Video');
require('dotenv').config();

const YOUTUBE_API_URL = 'https://www.googleapis.com/youtube/v3/search';
const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY;
const SEARCH_QUERY = process.env.SEARCH_QUERY || 'official';

/**
 * Fetch videos from YouTube API
 * @param {string} query - Search query
 * @param {string} pageToken - Token for pagination
 * @returns {Promise<Object>} - YouTube API response
 */
const fetchVideosFromYouTube = async (query = SEARCH_QUERY, pageToken = null) => {
  try {
    const params = {
      part: 'snippet',
      q: query,
      key: YOUTUBE_API_KEY,
      maxResults: 50,
      type: 'video',
      order: 'date',
    };

    if (pageToken) {
      params.pageToken = pageToken;
    }

    const response = await axios.get(YOUTUBE_API_URL, { params });
    return response.data;
  } catch (error) {
    console.error('Error fetching videos from YouTube:', error.message);
    throw error;
  }
};

/**
 * Save videos to database
 * @param {Array} videos - Array of video objects from YouTube API
 * @returns {Promise<Array>} - Array of saved videos
 */
const saveVideosToDatabase = async (videos) => {
  try {
    const savedVideos = [];

    for (const item of videos) {
      const videoData = {
        videoId: item.id.videoId,
        title: item.snippet.title,
        description: item.snippet.description,
        publishedAt: new Date(item.snippet.publishedAt),
        thumbnails: item.snippet.thumbnails,
        channelTitle: item.snippet.channelTitle,
        channelId: item.snippet.channelId,
      };

      // Use findOneAndUpdate with upsert to avoid duplicates
      const video = await Video.findOneAndUpdate(
        { videoId: videoData.videoId },
        videoData,
        { upsert: true, new: true }
      );

      savedVideos.push(video);
    }

    return savedVideos;
  } catch (error) {
    console.error('Error saving videos to database:', error.message);
    throw error;
  }
};

/**
 * Fetch and save videos
 * @param {string} query - Search query
 * @returns {Promise<Array>} - Array of saved videos
 */
const fetchAndSaveVideos = async (query = SEARCH_QUERY) => {
  try {
    console.log(`Fetching videos for query: ${query}`);
    const youtubeData = await fetchVideosFromYouTube(query);
    
    if (youtubeData.items && youtubeData.items.length > 0) {
      const savedVideos = await saveVideosToDatabase(youtubeData.items);
      console.log(`Saved ${savedVideos.length} videos to database`);
      return savedVideos;
    } else {
      console.log('No videos found for the given query');
      return [];
    }
  } catch (error) {
    console.error('Error in fetchAndSaveVideos:', error.message);
    throw error;
  }
};

module.exports = {
  fetchVideosFromYouTube,
  saveVideosToDatabase,
  fetchAndSaveVideos,
};
