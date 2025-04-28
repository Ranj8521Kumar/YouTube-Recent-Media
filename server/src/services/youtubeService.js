/**
 * YouTube Service Module
 *
 * Provides functionality to interact with the YouTube Data API v3,
 * fetch videos based on search queries, and save them to the database.
 * Includes API key management for handling quota limits.
 *
 * @module services/youtubeService
 */

const axios = require('axios');
const Video = require('../models/Video');
const keyManager = require('./apiKeyManager');
require('dotenv').config();

/**
 * YouTube API configuration constants
 * @constant {string} YOUTUBE_API_URL - YouTube Data API v3 search endpoint
 * @constant {string} YOUTUBE_API_KEY - API key from environment variables
 * @constant {string} SEARCH_QUERY - Default search query from environment variables
 */
const YOUTUBE_API_URL = 'https://www.googleapis.com/youtube/v3/search';
const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY;
const SEARCH_QUERY = process.env.SEARCH_QUERY || 'official';

/**
 * Fetch videos from YouTube API
 *
 * Makes a request to the YouTube Data API v3 to fetch videos based on
 * the provided search query. Handles API key rotation if quota is exceeded.
 *
 * @async
 * @function fetchVideosFromYouTube
 * @param {string} [query=SEARCH_QUERY] - Search query to find videos
 * @param {string} [pageToken=null] - Token for pagination of results
 * @returns {Promise<Object>} - YouTube API response with video data
 * @throws {Error} - If all API keys are exhausted or other API errors occur
 */
const fetchVideosFromYouTube = async (query = SEARCH_QUERY, pageToken = null) => {
  if (!keyManager.hasAvailableKeys()) {
    throw new Error('All API keys are exhausted. Please try again later.');
  }

  const currentKey = keyManager.getCurrentKey();

  // Debug logging
  console.log('Query:', query);
  console.log('Using API key:', currentKey.slice(0, 8) + '...');

  try {
    const params = new URLSearchParams({
      part: 'snippet',
      q: query,
      key: currentKey,
      maxResults: 50,
      type: 'video',
      order: 'date'
    });

    if (pageToken) {
      params.append('pageToken', pageToken);
    }

    // Log the full URL (with key redacted) for debugging
    const debugUrl = `${YOUTUBE_API_URL}?${params.toString().replace(currentKey, 'REDACTED')}`;
    console.log('Request URL:', debugUrl);

    const response = await axios.get(YOUTUBE_API_URL, {
      params,
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    });

    return response.data;
  } catch (error) {
    console.error('Full error details:', {
      status: error.response?.status,
      data: error.response?.data,
      headers: error.response?.headers
    });

    if (error.response?.status === 403) {
      keyManager.markKeyAsExhausted();
      if (keyManager.hasAvailableKeys()) {
        console.log('Retrying with next key...');
        return fetchVideosFromYouTube(query, pageToken);
      }
    }
    throw error;
  }
};
/**
 * Save videos to database
 *
 * Processes video data from the YouTube API and saves it to the MongoDB database.
 * Uses upsert to avoid duplicate entries based on the video ID.
 *
 * @async
 * @function saveVideosToDatabase
 * @param {Array} videos - Array of video objects from YouTube API
 * @returns {Promise<Array>} - Array of saved video documents
 * @throws {Error} - If there's an error saving to the database
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
 *
 * Main service function that combines fetching videos from YouTube API
 * and saving them to the database. Used by the cron job to periodically
 * update the video collection.
 *
 * @async
 * @function fetchAndSaveVideos
 * @param {string} [query=SEARCH_QUERY] - Search query to find videos
 * @returns {Promise<Array>} - Array of saved video documents
 * @throws {Error} - If there's an error in fetching or saving
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

/**
 * Export service functions
 * @type {Object}
 */
module.exports = {
  fetchVideosFromYouTube,
  saveVideosToDatabase,
  fetchAndSaveVideos,
};
