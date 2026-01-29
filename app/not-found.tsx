import { FileQuestion, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="flex min-h-screen w-full flex-col items-center justify-center space-y-6 p-8">
      <div className="flex items-center space-x-3 text-muted-foreground">
        <FileQuestion size={32} />
        <h1 className="text-2xl font-bold">404 - Page Not Found</h1>
      </div>

      <div className="text-center space-y-2 max-w-md">
        <p className="text-muted-foreground">
          The page you&apos;re looking for doesn&apos;t exist or may have been moved.
        </p>
      </div>

      <Button
        asChild
        className="flex items-center space-x-2"
      >
        <Link href="/">
          <Home size={16} />
          <span>Go home</span>
        </Link>
      </Button>
    </div>
  );
}