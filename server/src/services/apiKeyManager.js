require('dotenv').config();

class APIKeyManager {
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

    getCurrentKey() {
        if (!this.hasAvailableKeys()) {
            throw new Error('No available API keys');
        }
        return this.keys[this.currentKeyIndex].key;
    }

    markKeyAsExhausted() {
        this.keys[this.currentKeyIndex].quotaExhausted = true;
        this.keys[this.currentKeyIndex].lastUsed = Date.now();
        this.rotateToNextKey();
    }

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

    resetExhaustedKeys() {
        const twentyFourHours = 24 * 60 * 60 * 1000;
        this.keys.forEach(key => {
            if (Date.now() - key.lastUsed >= twentyFourHours) {
                key.quotaExhausted = false;
            }
        });
    }

    hasAvailableKeys() {
        return this.keys.some(key => !key.quotaExhausted);
    }
}

const keyManager = new APIKeyManager(process.env.YOUTUBE_API_KEYS);

module.exports = keyManager;