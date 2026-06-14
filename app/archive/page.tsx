import { Suspense } from 'react';
import { getArchiveData } from '@/lib/archive-server';
import ArchiveClient from '@/components/archive/archiveClient';
import ArchiveLoading from '@/app/archive/loading';
import { getDemoArchiveData } from '@/lib/demo/archive';
import { isDemoServer } from '@/lib/demo/is-demo-server';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function Archive() {
  const { years } = (await isDemoServer())
    ? getDemoArchiveData()
    : await getArchiveData();

  return (
    <Suspense fallback={<ArchiveLoading />}>
      <ArchiveClient years={years} />
    </Suspense>
  );
}
