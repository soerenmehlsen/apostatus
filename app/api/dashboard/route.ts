import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
  try {

    const stocktakeSessions = await prisma.stocktakeSession.findMany({
      include: {
        stockChecks: {
          select: {
            id: true,
            status: true,
          }
        },
        uploadedFiles: {
          select: {
            id: true,
            location: true,
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: 10 // Limit to latest 10 sessions
    });

    // Get summary statistics
    const totalSessions = await prisma.stocktakeSession.count();
    const completedSessions = await prisma.stocktakeSession.count({
      where: { status: 'completed' }
    });
    const reviewSessions = await prisma.stocktakeSession.count({
      where: { status: 'review' }
    });

    // Format the data for the dashboard
    const formattedSessions = stocktakeSessions.map(session => ({
      id: session.id,
      name: session.createdBy || 'Unknown',
      date: session.createdAt.toISOString().split('T')[0], // Format as YYYY-MM-DD
      status: session.status,
      location: session.uploadedFiles?.map(file => file.location) || [],
      stockChecksCount: session.stockChecks.length
    }));

    return NextResponse.json({
      sessions: formattedSessions,
      stats: {
        totalSessions,
        completedSessions,
        reviewSessions,
        needsReview: reviewSessions
      }
    });
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch dashboard data' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}