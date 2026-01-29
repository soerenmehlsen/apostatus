import { Suspense } from 'react';
import UploadClient from '@/components/upload/uploadClient';
import { LoadingSpinner } from '@/components/ui/loading-spinner';

async function getUploadedFiles() {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/upload`, {
      next: { revalidate: 0 }
    });
    const data = await response.json();
    return data.files || [];
  } catch (error) {
    console.error('Failed to fetch uploaded files:', error);
    return [];
  }
}

export const dynamic = 'force-dynamic';

export default async function UploadPage() {
  const initialFiles = await getUploadedFiles();

  return (
    <Suspense fallback={<LoadingSpinner />}>
      <UploadClient initialFiles={initialFiles} />
    </Suspense>
  );
}
