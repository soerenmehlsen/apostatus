import { NextResponse } from 'next/server';
import { db as prisma } from '@/lib/db';


export async function GET() {
  try {
    console.log('Starting stocktake data fetch...');
    
    // Use Promise.all to fetch data concurrently
    const [files, locationData] = await Promise.all([
      prisma.uploadedFile.findMany({
        select: {
          id: true,
          filename: true,
          uploadDate: true,
          location: true,
          productCount: true,
        },
        orderBy: {
          uploadDate: 'desc'
        },
      }),
      // Get unique locations more efficiently using groupBy
      prisma.product.groupBy({
        by: ['location'],
        _count: {
          location: true
        },
        where: {
          location: {
            not: null
          }
        }
      })
    ]);
    
    console.log('Files fetched:', files.length);
    console.log('Locations found:', locationData.length);

    // Extract unique locations from groupBy result
    const locations = locationData.map(item => ({
      id: item.location,
      name: getLocationName(item.location),
      productCount: item._count.location
    }));

    return NextResponse.json({ 
      files: files.map(file => ({
        id: file.id,
        filename: file.filename,
        uploadDate: file.uploadDate.toISOString(),
        location: file.location,
        productCount: file.productCount,
      })),
      locations 
    });
  } catch (error) {
    console.error('Error fetching stocktake data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch stocktake data' },
      { status: 500 }
    );
  }
}

// Helper function to get location names
function getLocationName(locationId: string | null): string {
  if (!locationId) return 'Unknown';
  const locationNames: Record<string, string> = {
    '101': 'Main Floor',
    '102': 'Back Storage',
    '103': 'Refrigerator',
    '104': 'Controlled Substances',
    '105': 'OTC Section',
    '106': 'Emergency Kit',
  };
  
  return locationNames[locationId] || locationId;
}