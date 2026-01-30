import { Suspense } from 'react';
import NewStocktakeClient from '@/components/stocktake/newStocktakeClient';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { getBaseUrl } from '@/lib/url-helper';

async function getStocktakeData() {
  try {
    const response = await fetch(`${getBaseUrl()}/api/newstocktake`, {
      next: { revalidate: 0 }
    });
    const data = await response.json();
    return {
      locations: data.locations || [],
      files: data.files || []
    };
  } catch (error) {
    console.error('Failed to fetch stocktake data:', error);
    return {
      locations: [],
      files: []
    };
  }
}

export const dynamic = 'force-dynamic';

export default async function NewStocktake() {
  const { locations, files } = await getStocktakeData();

  return (
    <Suspense fallback={<LoadingSpinner />}>
      <NewStocktakeClient
        initialLocations={locations}
        initialFiles={files}
      />
    </Suspense>
  );
}
