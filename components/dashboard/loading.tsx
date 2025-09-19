import { Card, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";

const Loading = () => (
  <div className="space-y-6 px-6 py-4">
    <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
      <h1 className="text-2xl font-bold">Dashboard</h1>
      <div className="flex gap-4">
        <Link href="/upload">
          <Button>Upload</Button>
        </Link>
        <Link href="/stocktake/new">
          <Button>New Stocktake</Button>
        </Link>
      </div>
    </div>
    
    {/* Stats cards skeleton */}
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {[1, 2, 3].map((i) => (
        <Card key={i}>
          <CardHeader className="pb-2">
            <div className="h-4 bg-muted rounded animate-pulse mb-2"></div>
            <div className="h-8 bg-muted rounded animate-pulse"></div>
          </CardHeader>
        </Card>
      ))}
    </div>
    
    {/* Table skeleton */}
    <Card>
      <CardHeader>
        <div className="h-6 w-32 bg-muted rounded animate-pulse"></div>
      </CardHeader>
      <div className="p-6">
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-12 bg-muted rounded animate-pulse"></div>
          ))}
        </div>
      </div>
    </Card>
  </div>
);

export default Loading;