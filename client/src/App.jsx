/**
 * App.jsx
 *
 * Main application component that serves as the root component for the application.
 * This component sets up the basic layout structure and includes the Dashboard component.
 * It provides a full-height container with a light gray background for the application.
 */

import Dashboard from './components/Dashboard';

/**
 * App component - The root component of the application
 * @returns {JSX.Element} The rendered App component
 */
function App() {
  return (
    <div className="min-h-screen bg-gray-100">
      <Dashboard />
    </div>
  );
}

export default App;






