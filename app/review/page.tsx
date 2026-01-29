import { Suspense } from 'react';
import ReviewClient from '@/components/review/reviewClient';
import { LoadingSpinner } from '@/components/ui/loading-spinner';

interface PageProps {
  searchParams: Promise<{ sessionId?: string }>;
}

export default async function Review({ searchParams }: PageProps) {
  const { sessionId } = await searchParams;

  return (
    <Suspense fallback={<LoadingSpinner />}>
      <ReviewClient sessionId={sessionId} />
    </Suspense>
  );
}