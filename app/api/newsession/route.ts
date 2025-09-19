import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, locations, createdBy } = body;

    if (!name || !locations || locations.length === 0) {
      return NextResponse.json(
        { error: 'Name and locations are required' },
        { status: 400 }
      );
    }

    // Create a new stocktake session
    const session = await prisma.stocktakeSession.create({
      data: {
        name: `Stocktake - ${name}`,
        status: 'In Progress',
        createdBy: createdBy || name,
        createdAt: new Date(),
      },
    });

    console.log('Created stocktake session:', session.id);

    // Link uploaded files to this session for the selected locations
    await prisma.uploadedFile.updateMany({
      where: {
        location: {
          in: locations
        },
        stocktakeSessionId: null // Only update files not already linked to a session
      },
      data: {
        stocktakeSessionId: session.id
      }
    });

    return NextResponse.json({ 
      sessionId: session.id,
      message: 'Stocktake session created successfully' 
    });
  } catch (error) {
    console.error('Error creating stocktake session:', error);
    return NextResponse.json(
      { error: 'Failed to create stocktake session' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}