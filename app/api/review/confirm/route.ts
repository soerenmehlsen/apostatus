import { NextRequest, NextResponse } from 'next/server';
import { db as prisma } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const { sessionId } = await request.json();

    if (!sessionId) {
      return NextResponse.json(
        { error: 'Session ID is required' },
        { status: 400 }
      );
    }

    // Check if session exists
    const existingSession = await prisma.stocktakeSession.findUnique({
      where: { id: sessionId }
    });

    if (!existingSession) {
      return NextResponse.json(
        { error: 'Session not found' },
        { status: 404 }
      );
    }

    // Check if session is already completed
    if (existingSession.status === 'Completed') {
      return NextResponse.json(
        { error: 'Session is already completed' },
        { status: 400 }
      );
    }

    // Update session status to Completed
    const updatedSession = await prisma.stocktakeSession.update({
      where: { id: sessionId },
      data: {
        status: 'Completed',
        updatedAt: new Date()
      }
    });

    return NextResponse.json(
      { 
        message: 'Review confirmed successfully',
        sessionId: updatedSession.id,
        status: updatedSession.status
      },
      { status: 200 }
    );

  } catch (error) {
    console.error('Error confirming review:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}