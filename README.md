# YouTube Video Explorer

A full-stack application to fetch, store, and explore YouTube videos. The application consists of a Node.js backend API that fetches videos from the YouTube Data API and a React frontend for displaying and searching videos.

![YouTube Video Explorer](https://via.placeholder.com/800x400?text=YouTube+Video+Explorer)

## Live Demo
The application is deployed and can be accessed at:
- Frontend: [YouTube Video Explorer](https://youtube-recent-videos-1.onrender.com)
- Backend API: [API Endpoint](https://youtube-recent-videos.onrender.com)

## Project Overview

This project provides a platform to:
- Fetch the latest videos from YouTube based on search queries
- Store video metadata in MongoDB for efficient retrieval
- Display videos with a modern, responsive UI
- Search and filter videos by various criteria
- Paginate results for better performance

## Tech Stack

### Backend
- **Node.js** - JavaScript runtime
- **Express** - Web framework
- **MongoDB** - Database for storing video data
- **Mongoose** - MongoDB object modeling
- **Axios** - HTTP client for API requests
- **node-cron** - Task scheduler for periodic video fetching
- **Docker** - Containerization

### Frontend
- **React** - UI library
- **Vite** - Build tool and development server
- **TailwindCSS** - Utility-first CSS framework
- **React Router** - Client-side routing
- **Axios** - HTTP client for API requests

## Project Structure

```
youtube-api/
├── client/                 # Frontend React application
│   ├── public/             # Static files
│   ├── src/                # React source code
│   ├── package.json        # Frontend dependencies
│   └── README.md           # Frontend documentation
│
├── server/                 # Backend Node.js API
│   ├── src/                # Server source code
│   │   ├── config/         # Configuration files
│   │   ├── controllers/    # Request handlers
│   │   ├── models/         # Database models
│   │   ├── routes/         # API routes
│   │   ├── services/       # Business logic
│   │   └── index.js        # Entry point
│   ├── Dockerfile          # Docker configuration
│   ├── docker-compose.yml  # Docker Compose configuration
│   ├── package.json        # Backend dependencies
│   └── README.md           # Backend documentation
│
└── README.md               # Main project documentation
```

## Getting Started

### Prerequisites
- Node.js (v18 or higher)
- MongoDB (local or remote)
- YouTube Data API v3 key

### Installation and Setup

#### 1. Clone the repository
```bash
git clone https://github.com/yourusername/youtube-api.git
cd youtube-api
```

#### 2. Backend Setup
```bash
cd server
npm install

# Create .env file with your configuration
echo "PORT=3000
MONGODB_URI=mongodb://localhost:27017/youtube-api
YOUTUBE_API_KEY=your_youtube_api_key
SEARCH_QUERY=official
FETCH_INTERVAL=10000" > .env

# Start the server
npm run dev
```

#### 3. Frontend Setup
```bash
cd ../client
npm install
npm run dev
```

### Using Docker (Backend)
```bash
cd server

# Create .env file with your configuration
echo "YOUTUBE_API_KEY=your_youtube_api_key
SEARCH_QUERY=official
FETCH_INTERVAL=10000" > .env

# Build and start containers
docker-compose up -d
```

## API Endpoints

### Get Videos (Paginated)
```
GET /api/videos
```

Query Parameters:
- `page` (optional): Page number (default: 1)
- `limit` (optional): Number of videos per page (default: 12)
- `sortBy` (optional): Field to sort by (default: 'publishedAt')
- `sortOrder` (optional): Sort order (asc or desc, default: 'desc')
- `channelTitle` (optional): Filter by channel title
- `dateFrom` (optional): Filter by date from (ISO format)
- `dateTo` (optional): Filter by date to (ISO format)
- `title` (optional): Filter by video title

### Search Videos
```
GET /api/videos/search?q=search_term
```

Query Parameters:
- `q` (required): Search term
- `page` (optional): Page number (default: 1)
- `limit` (optional): Number of videos per page (default: 10)

## Features

### Backend
- **Automatic Video Fetching**: Periodically fetches new videos from YouTube
- **API Key Management**: Handles YouTube API key rotation and quota limits
- **Efficient Data Storage**: Uses MongoDB with proper indexing for fast queries
- **Flexible Search**: Text-based search on video titles and descriptions
- **Pagination**: Efficient data retrieval with pagination support
- **Filtering**: Multiple filter options for the dashboard

### Frontend
- **Responsive Design**: Works on desktop and mobile devices
- **Video Grid**: Displays videos in a grid layout with thumbnails
- **Search Functionality**: Search videos by title and description
- **Advanced Filtering**: Filter videos by title, channel, and date range
- **Flexible Sorting**: Sort videos by publish date, title, or channel in ascending or descending order
- **Pagination Controls**: Navigate through pages of results
- **Video Modal**: View detailed information and watch videos directly in the application
- **Interactive UI**: Hover effects and smooth transitions for better user experience

## Deployment

### Backend
The backend is deployed on [Render](https://render.com) using the configuration in `server/render.yaml`. It can also be deployed using Docker to any cloud provider that supports Docker containers (AWS, Google Cloud, Azure, etc.).

### Frontend
The frontend is deployed on [Netlify](https://netlify.com). It can also be deployed to other static hosting services like Vercel or GitHub Pages.

## Contributing
Contributions are welcome! Please feel free to submit a Pull Request.

## License
This project is licensed under the ISC License.

## Acknowledgements
- [YouTube Data API](https://developers.google.com/youtube/v3)
- [MongoDB](https://www.mongodb.com/)
- [Express](https://expressjs.com/)
- [React](https://reactjs.org/)
- [TailwindCSS](https://tailwindcss.com/)
- [Vite](https://vitejs.dev/)
- [Render](https://render.com/)
