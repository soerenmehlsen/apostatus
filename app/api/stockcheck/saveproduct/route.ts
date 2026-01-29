import { NextRequest, NextResponse } from 'next/server';
import { db as prisma } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
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
              checkedBy: checkData.checkedBy,
              status: checkData.status,
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
              checkedBy: checkData.checkedBy,
              status: checkData.status
            }
          });
        }
        
        stockChecks.push(stockCheck);
      }

      return NextResponse.json({ success: true, stockChecks });
    }

    // Handle single operation
    const { productId, sessionId, expectedQty, countedQty, variance, checkedBy, status } = body;

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
          status
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