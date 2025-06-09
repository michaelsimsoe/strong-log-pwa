import { useState, useEffect } from 'react';
import PageWrapper from '@/components/layout/PageWrapper';

/**
 * HomePage component that displays the main welcome screen
 */
export default function HomePage() {
  const [count, setCount] = useState(0);
  const [dbInitialized, setDbInitialized] = useState(false);
  const [dbError] = useState<Error | null>(null);

  // Initialize database status
  useEffect(() => {
    // This would typically check the database status
    // For now, we'll just set it to initialized after a short delay
    const timer = setTimeout(() => {
      setDbInitialized(true);
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  return (
    <main className="flex-1">
      <PageWrapper>
        <div className="space-y-6">
          <div className="space-y-2">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-50">
              Welcome to StrongLog
            </h2>
            <p className="text-gray-500 dark:text-gray-400">
              Your personal strength training companion
            </p>
          </div>

          {dbError ? (
            <div className="p-4 bg-red-100 text-red-800 rounded-md dark:bg-red-900 dark:text-red-200">
              <p>Database initialization failed: {dbError.message}</p>
            </div>
          ) : (
            <div className="p-4 bg-blue-50 text-blue-800 rounded-md dark:bg-blue-900 dark:text-blue-200">
              <p>Database status: {dbInitialized ? 'Initialized' : 'Initializing...'}</p>
            </div>
          )}

          <div className="flex justify-center">
            <button
              className="px-4 py-2 bg-primary-500 text-white rounded-md hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={() => setCount(count => count + 1)}
              disabled={!dbInitialized || !!dbError}
            >
              You clicked {count} times
            </button>
          </div>
        </div>
      </PageWrapper>
    </main>
  );
}
