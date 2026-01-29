import { Loader2, Package } from 'lucide-react';

export default function StocktakeLoading() {
  return (
    <div className="flex min-h-screen w-full items-center justify-center">
      <div className="flex flex-col items-center space-y-4">
        <div className="relative">
          <Package className="h-12 w-12 text-muted-foreground" />
          <Loader2 className="absolute -top-1 -right-1 h-6 w-6 animate-spin text-primary" />
        </div>
        <div className="text-center space-y-1">
          <p className="text-sm font-medium">Loading stocktake data...</p>
          <p className="text-xs text-muted-foreground">Please wait while we prepare your inventory</p>
        </div>
      </div>
    </div>
  );
}