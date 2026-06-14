import Link from "next/link";
import { ArrowLeft, ScanSearch } from "lucide-react";
import { getArchiveSessionDetail } from "@/lib/archive-server";
import ArchiveDetailClient from "@/components/archive/archiveDetailClient";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export const dynamic = "force-dynamic";
export const revalidate = 0;

interface PageProps {
  params: Promise<{ sessionId: string }>;
}

export default async function ArchiveDetail({ params }: PageProps) {
  const { sessionId } = await params;
  const detail = await getArchiveSessionDetail(sessionId);

  if (!detail) {
    return (
      <div className="mx-auto w-full max-w-5xl space-y-6">
        <Link
          href="/archive"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="size-4" aria-hidden />
          Tilbage til arkiv
        </Link>
        <Card className="items-center gap-3 py-12 text-center">
          <div className="flex size-12 items-center justify-center rounded-full bg-muted">
            <ScanSearch className="size-6 text-muted-foreground" aria-hidden />
          </div>
          <p className="text-sm text-muted-foreground">
            Denne lagerstatus findes ikke i arkivet.
          </p>
          <Button asChild variant="outline">
            <Link href="/archive">Tilbage til arkiv</Link>
          </Button>
        </Card>
      </div>
    );
  }

  return <ArchiveDetailClient detail={detail} />;
}
