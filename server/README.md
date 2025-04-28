# YouTube Video API

An API to fetch and store YouTube videos for a given search query. The API provides paginated responses and search functionality.

## Features

- Fetches latest videos from YouTube API based on a search query
- Stores video data in MongoDB
- Provides paginated API endpoints
- Includes search functionality
- Dockerized for easy deployment

## Prerequisites

- Node.js (v14 or higher)
- MongoDB
- YouTube Data API v3 key

## Installation

### Local Development

1. Clone the repository
2. Install dependencies:
   ```
   npm install
   ```
3. Create a `.env` file in the root directory with the following variables:
   ```
   PORT=3000
   MONGODB_URI=mongodb://localhost:27017/youtube-api
   YOUTUBE_API_KEY=your_youtube_api_key
   SEARCH_QUERY=official
   FETCH_INTERVAL=10000
   ```
4. Start the development server:
   ```
   npm run dev
   ```

### Using Docker

1. Make sure Docker and Docker Compose are installed on your system
2. Create a `.env` file in the root directory with your YouTube API key:
   ```
   YOUTUBE_API_KEY=your_youtube_api_key
   SEARCH_QUERY=official
   FETCH_INTERVAL=10000
   ```
3. Build and start the containers:
   ```
   docker-compose up -d
   ```

## API Endpoints

### Get Videos (Paginated)

```
GET /api/videos
```

Query Parameters:
- `page` (optional): Page number (default: 1)
- `limit` (optional): Number of videos per page (default: 10)

### Search Videos

```
GET /api/videos/search?q=search_term
```

Query Parameters:
- `q` (required): Search term
- `page` (optional): Page number (default: 1)
- `limit` (optional): Number of videos per page (default: 10)

## How It Works

1. The application fetches videos from the YouTube API based on the specified search query
2. Videos are stored in MongoDB with proper indexing for efficient querying
3. The application runs a background task to periodically fetch new videos
4. The API provides endpoints to retrieve videos in a paginated format and search for videos

## Scalability and Optimization

- MongoDB indexes are used for efficient querying
- Text indexes are used for search functionality
- The application is containerized for easy scaling
- Background tasks are used to fetch videos asynchronously

## License

This project is licensed under the ISC License.
