import { Card } from "@/components/ui/card";

export default function ArchiveDetailLoading() {
  return (
    <div className="mx-auto w-full max-w-5xl space-y-8">
      <div className="space-y-3">
        <div className="h-4 w-32 animate-pulse rounded bg-muted" />
        <div className="h-8 w-48 animate-pulse rounded bg-muted" />
      </div>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 sm:gap-4">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="h-24 animate-pulse bg-muted py-0" />
        ))}
      </div>
      <Card className="gap-3 py-5">
        <div className="space-y-2 px-5">
          {[1, 2, 3, 4, 5].map((row) => (
            <div key={row} className="h-12 animate-pulse rounded bg-muted" />
          ))}
        </div>
      </Card>
    </div>
  );
}
