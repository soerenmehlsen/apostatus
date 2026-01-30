import { getInitialDashboardData } from '@/lib/dashboard-server';
import DashboardClient from '@/components/dashboard/dashboardClient';
import { Suspense } from 'react';
import Loading from '@/components/dashboard/loading';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function Dashboard() {
  const { sessions, stats } = await getInitialDashboardData();

  return (
    <Suspense fallback={<Loading />}>
      <DashboardClient 
        initialSessions={sessions}
        initialStats={stats}
      />
    </Suspense>
  );
}