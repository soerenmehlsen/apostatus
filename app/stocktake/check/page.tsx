import { Suspense } from 'react';
import StockCheckClient from '@/components/stocktake/stockCheckClient';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { getBaseUrl } from '@/lib/url-helper';
import { isDemoServer } from '@/lib/demo/is-demo-server';

interface PageProps {
  searchParams: Promise<{
    locations?: string;
    sessionId?: string;
  }>;
}

async function getStockCheckData(sessionId?: string) {
  try {
    const searchParams = new URLSearchParams();
    if (sessionId) {
      searchParams.append('sessionId', sessionId);
    }

    const response = await fetch(`${getBaseUrl()}/api/stockcheck/stockdata?${searchParams.toString()}`, {
      next: { revalidate: 0 }
    });
    const data = await response.json();
    return {
      products: data.data?.products || [],
      locations: data.data?.locations || [],
      checks: data.data?.checks || []
    };
  } catch (error) {
    console.error('Failed to fetch stock check data:', error);
    return {
      products: [],
      locations: [],
      checks: []
    };
  }
}

export default async function StockCheck({ searchParams }: PageProps) {
  const { sessionId } = await searchParams;

  if (await isDemoServer()) {
    // Tom start-data -> klienten henter via interceptoren ud fra sessionId.
    return (
      <Suspense fallback={<LoadingSpinner />}>
        <StockCheckClient />
      </Suspense>
    );
  }

  const { products, locations, checks } = await getStockCheckData(sessionId);

  return (
    <Suspense fallback={<LoadingSpinner />}>
      <StockCheckClient
        initialProducts={products}
        initialLocations={locations}
        initialChecks={checks}
      />
    </Suspense>
  );
}
