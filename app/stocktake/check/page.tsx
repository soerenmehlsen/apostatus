import { Suspense } from 'react';
import StockCheckClient from '@/components/stocktake/stockCheckClient';
import { LoadingSpinner } from '@/components/ui/loading-spinner';

interface PageProps {
  searchParams: Promise<{
    locations?: string;
    initials?: string;
    sessionId?: string;
  }>;
}

async function getStockCheckData(sessionId?: string) {
  try {
    const searchParams = new URLSearchParams();
    if (sessionId) {
      searchParams.append('sessionId', sessionId);
    }

    const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/stockcheck/stockdata?${searchParams.toString()}`, {
      next: { revalidate: 0 }
    });
    const data = await response.json();
    return {
      products: data.data?.products || [],
      locations: data.data?.locations || []
    };
  } catch (error) {
    console.error('Failed to fetch stock check data:', error);
    return {
      products: [],
      locations: []
    };
  }
}

export default async function StockCheck({ searchParams }: PageProps) {
  const { sessionId } = await searchParams;
  const { products, locations } = await getStockCheckData(sessionId);

  return (
    <Suspense fallback={<LoadingSpinner />}>
      <StockCheckClient
        initialProducts={products}
        initialLocations={locations}
      />
    </Suspense>
  );
}
