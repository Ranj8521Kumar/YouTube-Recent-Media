/**
 * main.jsx
 *
 * Entry point for the React application.
 * This file initializes the React application and mounts it to the DOM.
 * It uses React 18's createRoot API for concurrent rendering capabilities.
 * The application is wrapped in StrictMode for additional development checks.
 */

import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

// Create a root and render the App component inside StrictMode
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
