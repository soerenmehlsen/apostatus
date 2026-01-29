'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);

    // Call optional error handler
    this.props.onError?.(error, errorInfo);

    // You could also send error to monitoring service here
    // trackError(error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  public render() {
    if (this.state.hasError) {
      // Custom fallback UI
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default error UI
      return (
        <div className="flex min-h-[400px] w-full flex-col items-center justify-center space-y-4 p-8">
          <div className="flex items-center space-x-2 text-destructive">
            <AlertTriangle size={24} />
            <h2 className="text-lg font-semibold">Something went wrong</h2>
          </div>

          <p className="text-center text-muted-foreground max-w-md">
            {process.env.NODE_ENV === 'development'
              ? this.state.error?.message || 'An unexpected error occurred'
              : 'An unexpected error occurred. Please try again.'
            }
          </p>

          <Button
            onClick={this.handleReset}
            variant="outline"
            className="flex items-center space-x-2"
          >
            <RefreshCw size={16} />
            <span>Try again</span>
          </Button>

          {process.env.NODE_ENV === 'development' && this.state.error && (
            <details className="w-full max-w-2xl">
              <summary className="cursor-pointer text-sm text-muted-foreground hover:text-foreground">
                Show error details
              </summary>
              <pre className="mt-2 whitespace-pre-wrap rounded border bg-muted p-4 text-xs text-muted-foreground overflow-auto">
                {this.state.error.stack}
              </pre>
            </details>
          )}
        </div>
      );
    }

    return this.props.children;
  }
}

// Higher-order component for easier usage
export function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  errorBoundaryProps?: Omit<Props, 'children'>
) {
  const WrappedComponent = (props: P) => (
    <ErrorBoundary {...errorBoundaryProps}>
      <Component {...props} />
    </ErrorBoundary>
  );

  WrappedComponent.displayName = `withErrorBoundary(${Component.displayName || Component.name})`;

  return WrappedComponent;
}