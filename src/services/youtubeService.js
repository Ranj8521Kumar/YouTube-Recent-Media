const axios = require('axios');
const Video = require('../models/Video');
const keyManager = require('./apiKeyManager');
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
