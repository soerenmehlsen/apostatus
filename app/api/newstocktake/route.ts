import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();


export async function GET() {
  try {
    console.log('Starting stocktake data fetch...');
    
    const files = await prisma.uploadedFile.findMany({
      orderBy: {
        uploadDate: 'desc', // Changed from 'location' to match your upload API
      },
    });
    console.log('Files fetched:', files.length);

    // Get all products to extract unique locations
    const products = await prisma.product.findMany({
      select: {
        location: true,
      },
      distinct: ['location'],
    });
    console.log('Products fetched:', products.length);

    // Extract unique locations from products
    const locations = products.map((product: { location: string }) => ({
      id: product.location,
      name: getLocationName(product.location),
    }));

    return NextResponse.json({ 
      files: files.map((file: any) => ({
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
  } finally {
    await prisma.$disconnect();
  }
}

// Helper function to get location names
function getLocationName(locationId: string): string {
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