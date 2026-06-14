import { NextRequest, NextResponse } from 'next/server';
import { db as prisma } from '@/lib/db';
import { auth } from '@/auth';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const authSession = await auth();
    const checkedBy = authSession?.user?.name ?? 'Unknown';

    // Handle batch operations
    if (Array.isArray(body)) {
      const stockChecks = [];
      
      for (const checkData of body) {
        // Check if record exists
        const existingCheck = await prisma.stockCheck.findFirst({
          where: {
            productId: checkData.productId,
            sessionId: checkData.sessionId
          }
        });

        let stockCheck;
        if (existingCheck) {
          // Update existing record
          stockCheck = await prisma.stockCheck.update({
            where: { id: existingCheck.id },
            data: {
              countedQty: checkData.countedQty,
              variance: checkData.variance,
              checkedBy,
              status: checkData.status,
              reason: checkData.reason ?? null,
              checkedAt: new Date()
            }
          });
        } else {
          // Create new record
          stockCheck = await prisma.stockCheck.create({
            data: {
              productId: checkData.productId,
              sessionId: checkData.sessionId,
              expectedQty: checkData.expectedQty,
              countedQty: checkData.countedQty,
              variance: checkData.variance,
              checkedBy,
              status: checkData.status,
              reason: checkData.reason ?? null
            }
          });
        }
        
        stockChecks.push(stockCheck);
      }

      return NextResponse.json({ success: true, stockChecks });
    }

    // Handle single operation
    const { productId, sessionId, expectedQty, countedQty, variance, status, reason } = body;

    const existingCheck = await prisma.stockCheck.findFirst({
      where: {
        productId,
        sessionId
      }
    });

    let stockCheck;
    if (existingCheck) {
      stockCheck = await prisma.stockCheck.update({
        where: { id: existingCheck.id },
        data: {
          countedQty,
          variance,
          checkedBy,
          status,
          reason: reason ?? null,
          checkedAt: new Date()
        }
      });
    } else {
      stockCheck = await prisma.stockCheck.create({
        data: {
          productId,
          sessionId,
          expectedQty,
          countedQty,
          variance,
          checkedBy,
          status,
          reason: reason ?? null
        }
      });
    }

    return NextResponse.json({ success: true, stockCheck });
  } catch (error) {
    console.error('Error saving stock check:', error);
    return NextResponse.json(
      { error: 'Failed to save stock check' },
      { status: 500 }
    );
  }
}

// Remove a previously saved count when a line is un-confirmed mid-stocktake.
export async function DELETE(request: NextRequest) {
  try {
    const { productId, sessionId } = await request.json();

    if (!productId || !sessionId) {
      return NextResponse.json(
        { error: 'productId and sessionId are required' },
        { status: 400 }
      );
    }

    await prisma.stockCheck.deleteMany({
      where: { productId, sessionId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting stock check:', error);
    return NextResponse.json(
      { error: 'Failed to delete stock check' },
      { status: 500 }
    );
  }
}