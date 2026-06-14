import { Card } from "@/components/ui/card";

export default function ArchiveLoading() {
  return (
    <div className="mx-auto w-full max-w-6xl space-y-8">
      <div className="space-y-2">
        <div className="h-8 w-40 animate-pulse rounded bg-muted" />
        <div className="h-4 w-64 animate-pulse rounded bg-muted" />
      </div>
      <div className="h-10 w-full max-w-md animate-pulse rounded-md bg-muted" />
      <div className="space-y-4">
        {[1, 2].map((group) => (
          <Card key={group} className="gap-4 py-5">
            <div className="px-5">
              <div className="h-6 w-24 animate-pulse rounded bg-muted" />
            </div>
            <div className="space-y-2 px-5">
              {[1, 2, 3].map((row) => (
                <div
                  key={row}
                  className="h-12 animate-pulse rounded bg-muted"
                />
              ))}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
