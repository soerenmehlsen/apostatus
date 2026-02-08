import { DashboardSession, DashboardStats } from '@/types/dashboard';
import { SessionStatus } from '@/types/api';
import { db as prisma } from '@/lib/db';

export async function getInitialDashboardData(): Promise<{
  sessions: DashboardSession[];
  stats: DashboardStats;
  databaseConnected: boolean;
}> {
  const fallbackData = {
    sessions: [],
    stats: {
      needsReview: 0,
      completedSessions: 0,
      totalSessions: 0,
      reviewSessions: 0,
    },
    databaseConnected: false,
  };

  try {
    console.log('Server: Starting dashboard data fetch...');
    
    // Single optimized query to get all needed data
    const [stocktakeSessions, sessionStats] = await Promise.all([
      // Get latest 10 sessions with related data
      prisma.stocktakeSession.findMany({
        include: {
          uploadedFiles: {
            select: {
              location: true,
            },
            take: 5 // Limit to prevent over-fetching
          },
          _count: {
            select: {
              stockChecks: true
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        },
        take: 10
      }),
      // Get stats in a single aggregation query
      prisma.stocktakeSession.groupBy({
        by: ['status'],
        _count: {
          id: true
        }
      })
    ]);

    // Calculate stats from aggregation result
    const statsMap = sessionStats.reduce((acc, stat) => {
      acc[stat.status.toLowerCase()] = stat._count.id;
      return acc;
    }, {} as Record<string, number>);

    const totalSessions = sessionStats.reduce((sum, stat) => sum + stat._count.id, 0);
    const completedSessions = statsMap.completed || 0;
    const reviewSessions = statsMap.review || 0;

    // Format the data for the dashboard sessions
    const formattedSessions: DashboardSession[] = stocktakeSessions.map(session => ({
      id: session.id, 
      name: session.createdBy || 'Unknown',
      date: session.createdAt.toISOString().split('T')[0],
      status: session.status as SessionStatus,
      location: session.uploadedFiles?.map(file => file.location) || [],
      stockChecksCount: session._count.stockChecks
    }));

    console.log('Server: Dashboard data fetched successfully');
    
    return {
      sessions: formattedSessions,
      stats: {
        totalSessions,
        completedSessions,
        reviewSessions,
        needsReview: reviewSessions
      },
      databaseConnected: true,
    };
    
  } catch (error) {
    console.error('Server: Error fetching initial dashboard data:', error);
    // Return fallback data 
    return fallbackData;
  }
}
