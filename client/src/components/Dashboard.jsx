/**
 * Dashboard.jsx
 *
 * Main dashboard component that displays YouTube videos with filtering, sorting, and pagination.
 * This component fetches video data from the API, allows users to filter and sort videos,
 * and provides a modal for viewing video details.
 */

import { useState, useEffect } from 'react';

/**
 * Dashboard component - Displays YouTube videos with filtering, sorting, and pagination
 * @returns {JSX.Element} The rendered Dashboard component
 */
const Dashboard = () => {
  // State for storing the list of videos fetched from the API
  const [videos, setVideos] = useState([]);

  // State for tracking loading status during API requests
  const [loading, setLoading] = useState(true);

  // State for controlling the visibility of the video detail modal
  const [isModalOpen, setIsModalOpen] = useState(false);

  // State for storing the currently selected video for the modal
  const [selectedVideo, setSelectedVideo] = useState(null);

  // State for storing filter criteria for the videos
  const [filters, setFilters] = useState({
    channelTitle: '', // Filter by channel name
    title: '',        // Filter by video title
    dateFrom: '',     // Filter by publish date (start)
    dateTo: '',       // Filter by publish date (end)
  });

  // State for storing sorting preferences
  const [sorting, setSorting] = useState({
    sortBy: 'publishedAt', // Field to sort by (default: publish date)
    sortOrder: 'desc'      // Sort order (default: descending/newest first)
  });

  // State for pagination information
  const [pagination, setPagination] = useState({
    currentPage: 1,   // Current page number
    totalPages: 0,    // Total number of pages
    totalVideos: 0    // Total number of videos matching criteria
  });

  /**
   * Fetches videos from the API based on current pagination, filters, and sorting
   * Constructs query parameters, makes the API request, and updates state with the response
   */
  const fetchVideos = async () => {
    try {
      setLoading(true);
      // Create query parameters from current state
      const queryParams = new URLSearchParams({
        page: pagination.currentPage,
        limit: 12, // Number of videos per page
        ...filters,
        ...sorting
      });

      // Make API request to fetch videos
      const response = await fetch(`https://youtube-recent-videos.onrender.com/api/videos?${queryParams}`);
      const data = await response.json();

      // Update state with fetched data if successful
      if (data.success) {
        setVideos(data.data);
        setPagination(data.pagination);
      }
    } catch (error) {
      console.error('Error fetching videos:', error);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Effect hook to fetch videos whenever pagination, filters, or sorting changes
   * This ensures the displayed videos are always in sync with the user's preferences
   */
  useEffect(() => {
    fetchVideos();
  }, [pagination.currentPage, filters, sorting]);

  /**
   * Handles changes to filter inputs
   * Updates the filters state and resets pagination to page 1
   *
   * @param {Object} e - The event object from the input change
   */
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
    // Reset to first page when filters change
    setPagination(prev => ({ ...prev, currentPage: 1 }));
  };

  /**
   * Handles changes to sorting options
   * Updates the sorting state and resets pagination to page 1
   *
   * @param {Object} e - The event object from the select change
   */
  const handleSortChange = (e) => {
    const { name, value } = e.target;
    setSorting(prev => ({
      ...prev,
      [name]: value
    }));
    // Reset to first page when sorting changes
    setPagination(prev => ({ ...prev, currentPage: 1 }));
  };

  /**
   * Handles clicking on a video card
   * Sets the selected video and opens the modal
   *
   * @param {Object} video - The video object that was clicked
   */
  const handleVideoClick = (video) => {
    setSelectedVideo(video);
    setIsModalOpen(true);
  };

  /**
   * Closes the video modal
   * Resets the selected video and closes the modal
   */
  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedVideo(null);
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4 text-center">Latest YouTube Videos</h1>

      {/* Filters Section - Allows filtering videos by title, channel, and date range */}
      <div className="bg-white p-4 rounded shadow mb-4">
        <h2 className="text-lg font-semibold mb-2">Filters</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Title filter input */}
          <label htmlFor="title-filter">
            By title:
            <input
              id="title-filter"
              type="text"
              name="title"
              placeholder="Filter by title"
              value={filters.title}
              onChange={handleFilterChange}
              className="border p-2 rounded w-full"
            />
          </label>
          {/* Channel filter input */}
          <label htmlFor="channel-filter">
            By channel:
            <input
              id="channel-filter"
              type="text"
              name="channelTitle"
              placeholder="Filter by channel"
              value={filters.channelTitle}
              onChange={handleFilterChange}
              className="border p-2 rounded w-full"
            />
          </label>
          {/* Date range filter - start date */}
          <label htmlFor="date-from-filter">
            From date:
            <input
              id="date-from-filter"
              type="date"
              name="dateFrom"
              value={filters.dateFrom}
              onChange={handleFilterChange}
              className="border p-2 rounded w-full"
            />
          </label>
          {/* Date range filter - end date */}
          <label htmlFor="date-to-filter">
            To date:
            <input
              id="date-to-filter"
              type="date"
              name="dateTo"
              value={filters.dateTo}
              onChange={handleFilterChange}
              className="border p-2 rounded w-full"
            />
          </label>
        </div>
      </div>

      {/* Sorting Section - Allows sorting videos by different fields and order */}
      <div className="bg-white p-4 rounded shadow mb-4">
        <h2 className="text-lg font-semibold mb-2">Sorting</h2>
        <div className="flex gap-4">
          {/* Sort by field selector */}
          <select
            name="sortBy"
            value={sorting.sortBy}
            onChange={handleSortChange}
            className="border p-2 rounded"
          >
            <option value="publishedAt">Published Date</option>
            <option value="title">Title</option>
            <option value="channelTitle">Channel</option>
          </select>
          {/* Sort order selector */}
          <select
            name="sortOrder"
            value={sorting.sortOrder}
            onChange={handleSortChange}
            className="border p-2 rounded"
          >
            <option value="desc">Descending</option>
            <option value="asc">Ascending</option>
          </select>
        </div>
      </div>

      {/* Videos Grid Section - Displays videos in a responsive grid layout */}
      {loading ? (
        <div className="text-center">Loading...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Map through videos array and render a card for each video */}
          {videos.map((video) => (
            <div
              key={video.videoId}
              className="bg-white rounded shadow cursor-pointer transform transition hover:scale-105"
              onClick={() => handleVideoClick(video)}
            >
              {/* Video thumbnail */}
              <img
                src={video.thumbnails.medium.url}
                alt={video.title}
                className="w-full rounded-t"
              />
              {/* Video information */}
              <div className="p-4">
                <h3 className="font-semibold mb-2">{video.title}</h3>
                <p className="text-sm text-gray-600">{video.channelTitle}</p>
                <p className="text-sm text-gray-500">
                  {new Date(video.publishedAt).toLocaleDateString()}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Video Modal - Displays when a video is clicked */}
      {isModalOpen && selectedVideo && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-4 max-w-4xl w-full mx-4">
            {/* Modal header with title and close button */}
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">{selectedVideo.title}</h2>
              <button
                onClick={closeModal}
                className="text-gray-500 hover:text-gray-700"
                aria-label="Close modal"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            {/* YouTube video embed with 16:9 aspect ratio */}
            <div className="relative pt-[56.25%]">
              <iframe
                className="absolute top-0 left-0 w-full h-full"
                src={`https://www.youtube.com/embed/${selectedVideo.videoId}`}
                title={selectedVideo.title}
                style={{ border: 0 }}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              ></iframe>
            </div>
            {/* Video details */}
            <div className="mt-4">
              <p className="text-sm text-gray-600">{selectedVideo.channelTitle}</p>
              <p className="text-sm text-gray-500 mt-2">
                Published on {new Date(selectedVideo.publishedAt).toLocaleDateString()}
              </p>
              <p className="mt-2">{selectedVideo.description}</p>
            </div>
          </div>
        </div>
      )}

      {/* Pagination Controls - For navigating between pages of results */}
      <div className="mt-4 flex justify-center gap-2">
        {/* Previous page button */}
        <button
          onClick={() => setPagination(prev => ({ ...prev, currentPage: prev.currentPage - 1 }))}
          disabled={!pagination.hasPrevPage}
          className="px-4 py-2 bg-blue-500 text-white rounded disabled:bg-gray-300"
          aria-label="Go to previous page"
        >
          Previous
        </button>
        {/* Page indicator */}
        <span className="px-4 py-2">
          Page {pagination.currentPage} of {pagination.totalPages}
        </span>
        {/* Next page button */}
        <button
          onClick={() => setPagination(prev => ({ ...prev, currentPage: prev.currentPage + 1 }))}
          disabled={!pagination.hasNextPage}
          className="px-4 py-2 bg-blue-500 text-white rounded disabled:bg-gray-300"
          aria-label="Go to next page"
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default Dashboard;
