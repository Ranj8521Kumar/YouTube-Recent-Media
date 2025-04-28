/**
 * API Key Manager Module
 *
 * Manages multiple YouTube API keys to handle quota limitations.
 * Provides functionality to rotate keys, track exhausted keys,
 * and reset keys after the quota period (24 hours).
 *
 * @module services/apiKeyManager
 */

require('dotenv').config();

/**
 * API Key Manager Class
 *
 * Handles the management of multiple YouTube API keys, including:
 * - Initialization from comma-separated list of keys
 * - Rotation between keys when quota is exhausted
 * - Tracking of exhausted keys and reset after 24 hours
 *
 * @class APIKeyManager
 */
class APIKeyManager {
    /**
     * Create an API Key Manager instance
     *
     * @constructor
     * @param {string} keys - Comma-separated list of YouTube API keys
     * @throws {Error} If no valid keys are provided
     */
    constructor(keys) {
        if (!keys || typeof keys !== 'string' || keys.trim() === '') {
            throw new Error('No YouTube API keys provided. Please set YOUTUBE_API_KEYS in your environment variables.');
        }

        const keyArray = keys.split(',').map(key => key.trim()).filter(key => key !== '');

        if (keyArray.length === 0) {
            throw new Error('No valid API keys found after processing.');
        }

        console.log(`Initialized with ${keyArray.length} API keys`);

        this.keys = keyArray.map(key => ({
            key: key,
            quotaExhausted: false,
            lastUsed: 0
        }));
        this.currentKeyIndex = 0;
    }

    /**
     * Get the current active API key
     *
     * @returns {string} The current API key
     * @throws {Error} If no available keys exist
     */
    getCurrentKey() {
        if (!this.hasAvailableKeys()) {
            throw new Error('No available API keys');
        }
        return this.keys[this.currentKeyIndex].key;
    }

    /**
     * Mark the current key as having exhausted its quota
     *
     * Records the time when the key was marked as exhausted
     * and rotates to the next available key.
     */
    markKeyAsExhausted() {
        this.keys[this.currentKeyIndex].quotaExhausted = true;
        this.keys[this.currentKeyIndex].lastUsed = Date.now();
        this.rotateToNextKey();
    }

    /**
     * Rotate to the next available API key
     *
     * Cycles through the keys until finding one that is not exhausted.
     * If all keys are exhausted, attempts to reset keys older than 24 hours.
     */
    rotateToNextKey() {
        const startIndex = this.currentKeyIndex;
        do {
            this.currentKeyIndex = (this.currentKeyIndex + 1) % this.keys.length;
            // If we've checked all keys and come back to the start, reset quotaExhausted for keys older than 24 hours
            if (this.currentKeyIndex === startIndex) {
                this.resetExhaustedKeys();
            }
        } while (
            this.keys[this.currentKeyIndex].quotaExhausted &&
            this.currentKeyIndex !== startIndex
        );
    }

    /**
     * Reset exhausted keys that are older than 24 hours
     *
     * YouTube API quota resets after 24 hours, so keys that were
     * exhausted more than 24 hours ago can be used again.
     */
    resetExhaustedKeys() {
        const twentyFourHours = 24 * 60 * 60 * 1000;
        this.keys.forEach(key => {
            if (Date.now() - key.lastUsed >= twentyFourHours) {
                key.quotaExhausted = false;
            }
        });
    }

    /**
     * Check if there are any available (non-exhausted) API keys
     *
     * @returns {boolean} True if at least one key is available, false otherwise
     */
    hasAvailableKeys() {
        return this.keys.some(key => !key.quotaExhausted);
    }
}

/**
 * Create a singleton instance of the API Key Manager
 *
 * Initializes with the API keys from the YOUTUBE_API_KEYS environment variable.
 * @type {APIKeyManager}
 */
const keyManager = new APIKeyManager(process.env.YOUTUBE_API_KEYS);

/**
 * Export the singleton instance
 * @module apiKeyManager
 */
module.exports = keyManager;