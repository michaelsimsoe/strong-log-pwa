import { useEffect } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router';
import ErrorBoundary from './components/shared/ErrorBoundary';
import { initDatabase } from './services/data/db';
import Navbar from './components/layout/Navbar';
import BottomNavigation from './components/layout/BottomNavigation';
import { useUserSettingsStore } from './state/userSettingsStore';

function App() {
  // Initialize theme from settings store
  const { initializeSettings, applyTheme } = useUserSettingsStore();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const initDb = async () => {
      try {
        await initDatabase();

        // Initialize user settings after database is ready
        await initializeSettings();
      } catch (error) {
        console.error('Failed to initialize database:', error);
      }
    };

    initDb();

    // Apply theme based on system preference initially
    applyTheme();

    // Listen for system theme changes
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = () => applyTheme();
    mediaQuery.addEventListener('change', handleChange);

    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [initializeSettings, applyTheme]);

  // Navigate to settings page
  const handleSettingsClick = () => {
    if (location.pathname === '/settings') {
      navigate('/');
    } else {
      navigate('/settings');
    }
  };

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col">
        <Navbar
          title={location.pathname === '/settings' ? 'Settings' : 'StrongLog'}
          onSettingsClick={handleSettingsClick}
        />

        <div className="flex-1 pb-16">
          {' '}
          {/* Add padding bottom to accommodate the bottom navigation */}
          <Outlet />
        </div>

        {/* Bottom Navigation */}
        <BottomNavigation />

        <footer className="bg-secondary-800 text-white py-4 px-4 dark:bg-secondary-950">
          <div className="container mx-auto max-w-screen-md text-center">
            <p>StrongLog PWA - Version 1.0</p>
          </div>
        </footer>
      </div>
    </ErrorBoundary>
  );
}

export default App;
