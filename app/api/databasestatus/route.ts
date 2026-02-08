import { db as prisma } from '@/lib/db';
import { ApiResponseBuilder } from '@/lib/api-response';
import { withErrorHandling } from '@/lib/api-middleware';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

// Ping the database to check if this endpoint can connect to the database.
export const GET = withErrorHandling(async () => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return ApiResponseBuilder.success({ connected: true });
  } catch (error) {
    console.error('Database ping failed:', error);
    return ApiResponseBuilder.success({ connected: false });
  }
});
