import { NextRequest, NextResponse } from 'next/server';
import { db as prisma } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { sessionId } = body;

    // Update session status to completed
    const updatedSession = await prisma.stocktakeSession.update({
      where: { id: sessionId },
      data: {
        status: 'Review',
        updatedAt: new Date()
      }
    });

    return NextResponse.json({ 
      success: true, 
      message: 'Stocktake completed successfully',
      session: updatedSession 
    });
  } catch (error) {
    console.error('Error completing stocktake:', error);
    return NextResponse.json(
      { error: 'Failed to complete stocktake' },
      { status: 500 }
    );
  }
}