import { getInitialDashboardData } from '@/lib/dashboard-server';
import DashboardClient from '@/components/dashboard/dashboardClient';
import { Suspense } from 'react';
import Loading from '@/components/dashboard/loading';
import { isDemoServer } from '@/lib/demo/is-demo-server';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function Dashboard() {
  if (await isDemoServer()) {
    // Ingen start-data -> DashboardClient henter selv via interceptoren.
    return (
      <Suspense fallback={<Loading />}>
        <DashboardClient />
      </Suspense>
    );
  }

  const { sessions, stats, databaseConnected } = await getInitialDashboardData();

  return (
    <Suspense fallback={<Loading />}>
      <DashboardClient 
        initialSessions={sessions}
        initialStats={stats}
        initialDatabaseConnected={databaseConnected}
      />
    </Suspense>
  );
}
