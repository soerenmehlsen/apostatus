import { NextRequest, NextResponse } from 'next/server';
import { db as prisma } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get('sessionId');

    let session;

    if (sessionId) {
      // Get specific session by ID
      session = await prisma.stocktakeSession.findUnique({
        where: {
          id: sessionId
        },
        include: {
          stockChecks: {
            include: {
              product: true
            }
          },
          uploadedFiles: {
            select: {
              location: true
            }
          }
        }
      });

      if (!session) {
        return NextResponse.json(
          { error: 'Stocktake session not found' },
          { status: 404 }
        );
      }
    } else {
      // Fallback: Get the latest completed stocktake session
      session = await prisma.stocktakeSession.findFirst({
        where: {
          status: {
            in: ['Review', 'Completed']
          }
        },
        orderBy: {
          createdAt: 'desc'
        },
        include: {
          stockChecks: {
            include: {
              product: true
            }
          },
          uploadedFiles: {
            select: {
              location: true
            }
          }
        }
      });

      console.log('API Debug - Found session:', session ? 'Yes' : 'No');
      console.log('API Debug - Session data:', session);

      if (!session) {
        return NextResponse.json(
          { error: 'No stocktake session found for review' },
          { status: 404 }
        );
      }
    }

    // Calculate discrepancies
    const checkResults = session.stockChecks
      .map(check => {
        const expectedQty = check.product.expectedQty || 0;
        const variance = check.countedQty - expectedQty;
        const value = variance * (check.product.price || 0);
        
        return {
          id: check.id,
          article: check.product.sku,
          name: check.product.name,
          expectedQty,
          countedQty: check.countedQty,
          variance,
          value,
        };
      })
      .filter(item => item.variance !== 0);

    // Calculate summary statistics
    const missingItems = checkResults.filter(item => item.variance < 0).length;
    const totalValueVariance = checkResults.reduce((sum, item) => sum + item.value, 0);
    const location = session.uploadedFiles[0]?.location || 'Unknown';

    return NextResponse.json({
      session: {
        id: session.id,
        date: session.createdAt.toISOString().split('T')[0],
        location: getLocationName(location),
        locationId: location,
        status: session.status,
        name: session.name
      },
      summary: {
        missingItems,
        totalValueVariance,
        totalDiscrepancies: checkResults.length
      },
      checkResults
    });
  } catch (error) {
    console.error('Error fetching review data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch review data' },
      { status: 500 }
    );
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