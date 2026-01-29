//import { NextRequest } from 'next/server';
import { db as prisma } from '@/lib/db';
import { Prisma } from '@prisma/client';
import { stockDataQuerySchema } from '@/lib/validations/stockcheck';
import { ApiResponseBuilder } from '@/lib/api-response';
import { withValidation, withErrorHandling } from '@/lib/api-middleware';
import { LOCATION_MAP } from '@/types/api';

export const GET = withErrorHandling(
  withValidation(stockDataQuerySchema)(async (request) => {
    const { location, sessionId } = request.validatedData;

    // Build dynamic where clause
    const whereClause: Prisma.ProductWhereInput = {}; 
    if (location) {
      whereClause.location = location;
    }
    if (sessionId) {
      whereClause.file = {
        stocktakeSessionId: sessionId
      };
    }

    // Get all products from uploaded files with optimized query
    const products = await prisma.product.findMany({
      where: whereClause,
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

    // Get unique locations from products (filter out null values)
    const locationIds = [...new Set(
      products
        .map(p => p.location)
        .filter((location): location is string => location !== null)
    )];

    const locations = locationIds.map(id => ({
      id,
      name: getLocationName(id)
    }));

    return ApiResponseBuilder.success({
      products,
      locations,
      totalProducts: products.length
    });
  })
);

// Helper function to get location names
function getLocationName(id: string): string {
  return LOCATION_MAP[id] || `Location ${id}`;
}