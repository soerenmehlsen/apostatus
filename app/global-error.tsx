'use client';

import { useEffect } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the critical error
    console.error('Global error:', error);
  }, [error]);

  return (
    <html>
      <body>
        <div className="flex min-h-screen w-full flex-col items-center justify-center space-y-6 p-8 bg-background text-foreground">
          <div className="flex items-center space-x-3 text-destructive">
            <AlertTriangle size={32} />
            <h1 className="text-2xl font-bold">Critical Error</h1>
          </div>

          <div className="text-center space-y-2 max-w-md">
            <p className="text-muted-foreground">
              A critical error occurred in the application. Please refresh the page to continue.
            </p>
          </div>

          <button
            onClick={reset}
            className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground shadow hover:bg-primary/90 h-9 px-4 py-2 space-x-2"
          >
            <RefreshCw size={16} />
            <span>Refresh page</span>
          </button>
        </div>
      </body>
    </html>
  );
}