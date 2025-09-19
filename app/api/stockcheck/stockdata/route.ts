import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
  try {
    // Get all products from uploaded files
    const products = await prisma.product.findMany({
      select: {
        id: true,
        name: true,
        sku: true,
        quantity: true,
        location: true,
        expectedQty: true,
      },
      orderBy: {
        name: 'asc'
      }
    });

    // Get unique locations from products
    const locationIds = [...new Set(products.map((p: any) => p.location))];
    const locations = locationIds.map(id => ({
      id,
      name: getLocationName(id as string)
    }));

    return NextResponse.json({
      products,
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
function getLocationName(id: string): string {
  const locationMap: Record<string, string> = {
    '101': 'Main Floor',
    '102': 'Back Storage',
    '103': 'Refrigerator',
    '104': 'Controlled Substances',
    '105': 'OTC Section',
    '111': 'Emergency Kit'
  };
  return locationMap[id] || `Location ${id}`;
}