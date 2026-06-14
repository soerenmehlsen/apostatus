import { Suspense } from 'react';
import { getArchiveData } from '@/lib/archive-server';
import ArchiveClient from '@/components/archive/archiveClient';
import ArchiveLoading from '@/app/archive/loading';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function Archive() {
  const { years } = await getArchiveData();

  return (
    <Suspense fallback={<ArchiveLoading />}>
      <ArchiveClient years={years} />
    </Suspense>
  );
}
