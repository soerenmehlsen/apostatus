'use client';

import { useEffect } from 'react';
import { AlertTriangle, Home, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log error to monitoring service
    console.error('Application error:', error);
  }, [error]);

  return (
    <div className="flex min-h-screen w-full flex-col items-center justify-center space-y-6 p-8">
      <div className="flex items-center space-x-3 text-destructive">
        <AlertTriangle size={32} />
        <h1 className="text-2xl font-bold">Application Error</h1>
      </div>

      <div className="text-center space-y-2 max-w-md">
        <p className="text-muted-foreground">
          Something went wrong with the application. This has been logged and we&apos;ll look into it.
        </p>
        {process.env.NODE_ENV === 'development' && (
          <p className="text-sm text-destructive font-mono bg-muted p-2 rounded">
            {error.message}
          </p>
        )}
      </div>

      <div className="flex space-x-3">
        <Button
          onClick={reset}
          variant="default"
          className="flex items-center space-x-2"
        >
          <RefreshCw size={16} />
          <span>Try again</span>
        </Button>

        <Button
          asChild
          variant="outline"
          className="flex items-center space-x-2"
        >
          <Link href="/">
            <Home size={16} />
            <span>Go home</span>
          </Link>
        </Button>
      </div>

      {process.env.NODE_ENV === 'development' && error.stack && (
        <details className="w-full max-w-4xl">
          <summary className="cursor-pointer text-sm text-muted-foreground hover:text-foreground mb-2">
            Show stack trace
          </summary>
          <pre className="whitespace-pre-wrap rounded border bg-muted p-4 text-xs text-muted-foreground overflow-auto">
            {error.stack}
          </pre>
        </details>
      )}
    </div>
  );
}