import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { productId, sessionId, expectedQty, countedQty, variance, checkedBy, status } = body;

    // Create or update stock check record
    const stockCheck = await prisma.stockCheck.upsert({
      where: {
        productId_sessionId: {
          productId,
          sessionId
        }
      },
      update: {
        countedQty,
        variance,
        checkedBy,
        status,
        checkedAt: new Date()
      },
      create: {
        productId,
        sessionId,
        expectedQty,
        countedQty,
        variance,
        checkedBy,
        status
      }
    });

    return NextResponse.json({ success: true, stockCheck });
  } catch (error) {
    console.error('Error saving stock check:', error);
    return NextResponse.json(
      { error: 'Failed to save stock check' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}