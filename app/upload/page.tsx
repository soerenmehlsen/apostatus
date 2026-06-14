import { Suspense } from 'react';
import UploadClient from '@/components/upload/uploadClient';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { getBaseUrl } from '@/lib/url-helper';
import { isDemoServer } from '@/lib/demo/is-demo-server';
import { createInitialDemoState } from '@/lib/demo/fixtures';

async function getUploadedFiles() {
  try {
    const response = await fetch(`${getBaseUrl()}/api/upload`, {
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
  if (await isDemoServer()) {
    // UploadClient henter ikke selv ved mount, så vi leverer base-fixtures.
    // Bemærk: sletning af demo-filer afspejles ikke her efter navigation.
    const { files } = createInitialDemoState();
    const initialFiles = files.map((f) => ({
      id: f.id,
      filename: f.filename,
      uploadDate: f.uploadDate,
      location: f.location,
      // UploadClient bruger products?.length til at vise antal — vi simulerer dette.
      products: Array.from({ length: f.productCount }),
    }));
    return (
      <Suspense fallback={<LoadingSpinner />}>
        <UploadClient initialFiles={initialFiles} />
      </Suspense>
    );
  }

  const initialFiles = await getUploadedFiles();

  return (
    <Suspense fallback={<LoadingSpinner />}>
      <UploadClient initialFiles={initialFiles} />
    </Suspense>
  );
}
