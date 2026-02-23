'use client';

import { useEffect, useState } from 'react';

/**
 * Component to initialize the database on first load
 */
export function InitializeApp({ children }: { children: React.ReactNode }) {
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    const init = async () => {
      try {
        // Call the server-side initialization API
        const response = await fetch('/api/init', {
          method: 'POST',
        });

        if (!response.ok) {
          console.error('Failed to initialize database');
        }

        setIsInitialized(true);
      } catch (error) {
        console.error('Failed to initialize database:', error);
        setIsInitialized(true); // Still allow app to load
      }
    };

    init();
  }, []);

  if (!isInitialized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Initializing application...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
