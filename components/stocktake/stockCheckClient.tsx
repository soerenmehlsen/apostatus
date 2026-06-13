"use client";
import { useEffect, useState, useCallback, useMemo } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ArrowLeft,
  Check,
  CheckCircle2,
  Equal,
  Minus,
  PackageSearch,
  Plus,
  Search,
  Undo2,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Progress } from "@/components/ui/progress";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { getLocationName } from "@/lib/dashboard-display";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface Product {
  id: string;
  name: string;
  sku: string;
  quantity: number;
  location: string;
  expectedQty: number;
}

interface StockCheckData {
  productId: string;
  sessionId: string;
  expectedQty: number;
  countedQty: number;
  variance: number;
  checkedBy: string;
  status: string;
}

interface StockCheckClientProps {
  initialProducts?: Product[];
  initialLocations?: { id: string; name: string }[];
}

export default function StockCheckClient({
  initialProducts = [],
}: StockCheckClientProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedLocations, setSelectedLocations] = useState<string[]>([]);
  const [initials, setInitials] = useState("");
  const [currentLocation, setCurrentLocation] = useState("");
  const [productCounts, setProductCounts] = useState<Record<string, number>>(
    {}
  );
  const [checkedProducts, setCheckedProducts] = useState<Set<string>>(
    new Set()
  );
  const [sessionId, setSessionId] = useState("");
  const [localChecks, setLocalChecks] = useState<Map<string, StockCheckData>>(
    new Map()
  );
  const [isCompleting, setIsCompleting] = useState(false);

  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [isLoading, setIsLoading] = useState(!initialProducts.length);

  const searchParams = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    const locationParam = searchParams.get("locations");
    const initialsParam = searchParams.get("initials");
    const sessionIdParam = searchParams.get("sessionId");

    if (locationParam) {
      const locations = locationParam.split(",");
      setSelectedLocations(locations);
      setCurrentLocation(locations[0]);
    }
    if (initialsParam) {
      setInitials(initialsParam);
    }
    if (sessionIdParam) {
      setSessionId(sessionIdParam);
    }
  }, [searchParams]);

  const fetchStocktakeData = useCallback(async () => {
    try {
      setIsLoading(true);
      const params = new URLSearchParams();
      if (sessionId) {
        params.append("sessionId", sessionId);
      }
      const response = await fetch(
        `/api/stockcheck/stockdata?${params.toString()}`
      );
      const data = await response.json();

      if (response.ok) {
        setProducts(data.data.products || []);
      } else {
        toast.error("Kunne ikke hente data", {
          description: data.error,
        });
      }
    } catch (error) {
      console.error("Error fetching stocktake data:", error);
      toast.error("Kunne ikke hente data", {
        description: "Prøv venligst igen senere.",
      });
    } finally {
      setIsLoading(false);
    }
  }, [sessionId]);

  useEffect(() => {
    if (!initialProducts.length && sessionId) {
      fetchStocktakeData();
    }
  }, [sessionId, initialProducts.length, fetchStocktakeData]);

  const setCount = (productId: string, value: number) => {
    setProductCounts((prev) => ({
      ...prev,
      [productId]: Math.max(0, value),
    }));
  };

  const updateProductCount = (productId: string, change: number) => {
    setCount(productId, (productCounts[productId] || 0) + change);
  };

  const setToExpectedQty = (productId: string, expectedQty: number) => {
    setCount(productId, expectedQty);
  };

  const handleProductCheck = (productId: string) => {
    const product = products.find((p) => p.id === productId);
    if (!product) return;

    // Toggle off — allow re-editing a line.
    if (checkedProducts.has(productId)) {
      setCheckedProducts((prev) => {
        const next = new Set(prev);
        next.delete(productId);
        return next;
      });
      setLocalChecks((prev) => {
        const next = new Map(prev);
        next.delete(productId);
        return next;
      });
      return;
    }

    const countedQty = productCounts[productId] || 0;
    const expectedQty = product.expectedQty || 0;
    const variance = countedQty - expectedQty;

    setLocalChecks((prev) =>
      new Map(prev).set(productId, {
        productId,
        sessionId,
        expectedQty,
        countedQty,
        variance,
        checkedBy: initials,
        status: "checked",
      })
    );
    setCheckedProducts((prev) => new Set(prev).add(productId));
  };

  // Per-location progress for the location tabs.
  const locationStats = useMemo(() => {
    return selectedLocations.map((id) => {
      const inLocation = products.filter((p) => p.location === id);
      const checked = inLocation.filter((p) => checkedProducts.has(p.id)).length;
      return {
        id,
        name: getLocationName(id),
        total: inLocation.length,
        checked,
        done: inLocation.length > 0 && checked === inLocation.length,
      };
    });
  }, [selectedLocations, products, checkedProducts]);

  const visibleProducts = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    return products.filter(
      (p) =>
        p.location === currentLocation &&
        (term === "" ||
          p.name.toLowerCase().includes(term) ||
          p.sku?.toLowerCase().includes(term) ||
          p.id.toLowerCase().includes(term))
    );
  }, [products, currentLocation, searchTerm]);

  // Overall progress across every selected location.
  const totalAll = products.length;
  const checkedAll = useMemo(
    () => products.filter((p) => checkedProducts.has(p.id)).length,
    [products, checkedProducts]
  );
  const progressPercentage = totalAll > 0 ? (checkedAll / totalAll) * 100 : 0;
  const isAllChecked = checkedAll === totalAll && totalAll > 0;

  const completeStocktake = async () => {
    if (!isAllChecked || localChecks.size === 0) return;

    setIsCompleting(true);
    const loadingToast = toast.loading("Afslutter lagerstatus...");

    try {
      const checksArray = Array.from(localChecks.values());

      const stockCheckResponse = await fetch("/api/stockcheck/saveproduct", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(checksArray),
      });

      if (!stockCheckResponse.ok) {
        throw new Error("Failed to save stock checks");
      }

      const response = await fetch("/api/stockcheck/completecheck", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId, completedBy: initials }),
      });

      if (response.ok) {
        toast.dismiss(loadingToast);
        toast.success("Lagerstatus afsluttet!", {
          description: `Alle ${checksArray.length} optællinger er gemt.`,
        });
        router.push("/dashboard");
      } else {
        throw new Error("Failed to complete stocktake");
      }
    } catch (error) {
      console.error("Error completing stocktake:", error);
      toast.dismiss(loadingToast);
      toast.error("Kunne ikke afslutte lagerstatus", {
        description: "Prøv igen eller tjek din forbindelse.",
      });
    } finally {
      setIsCompleting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="mx-auto w-full max-w-5xl space-y-8">
        <PageHeader initials={initials} />
        <Card className="items-center gap-3 py-16 text-center">
          <LoadingSpinner size="lg" />
          <p className="text-sm text-muted-foreground">
            Henter varer til optælling...
          </p>
        </Card>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-5xl space-y-6 pb-28 sm:pb-8">
      <PageHeader initials={initials} />

      {/* Location tabs with per-location progress */}
      {locationStats.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {locationStats.map((loc) => {
            const active = loc.id === currentLocation;
            return (
              <button
                key={loc.id}
                type="button"
                onClick={() => setCurrentLocation(loc.id)}
                className={cn(
                  "inline-flex items-center gap-2 rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors",
                  active
                    ? "bg-primary text-primary-foreground shadow-xs"
                    : "bg-muted text-muted-foreground hover:bg-muted/70 hover:text-foreground"
                )}
              >
                {loc.done && (
                  <CheckCircle2
                    className={cn(
                      "size-4",
                      active ? "text-primary-foreground" : "text-primary"
                    )}
                    aria-hidden
                  />
                )}
                <span>{loc.name}</span>
                <span
                  className={cn(
                    "tabular-nums text-xs",
                    active
                      ? "text-primary-foreground/80"
                      : "text-muted-foreground/80"
                  )}
                >
                  {loc.checked}/{loc.total}
                </span>
              </button>
            );
          })}
        </div>
      )}

      {/* Search */}
      <div className="relative sm:max-w-sm">
        <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Søg vare eller varenummer..."
          className="pl-9"
          aria-label="Søg varer"
        />
      </div>

      {visibleProducts.length === 0 ? (
        <EmptyState hasProducts={products.length > 0} />
      ) : (
        <>
          {/* Desktop: table */}
          <Card className="hidden overflow-hidden py-0 md:block">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead className="px-5 py-3">Vare</TableHead>
                  <TableHead className="px-5 py-3 text-center">
                    Forventet
                  </TableHead>
                  <TableHead className="px-5 py-3 text-center">Optalt</TableHead>
                  <TableHead className="px-5 py-3 text-center">
                    Afvigelse
                  </TableHead>
                  <TableHead className="px-5 py-3 text-right">
                    <span className="sr-only">Handling</span>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {visibleProducts.map((product) => {
                  const checked = checkedProducts.has(product.id);
                  const counted = productCounts[product.id] || 0;
                  const variance = counted - (product.expectedQty || 0);
                  return (
                    <TableRow
                      key={product.id}
                      className={cn(
                        "[&>td]:px-5 [&>td]:py-3",
                        checked && "bg-primary/[0.04]"
                      )}
                    >
                      <TableCell>
                        <div className="min-w-0">
                          <p className="truncate font-medium leading-tight">
                            {product.name}
                          </p>
                          <p className="font-mono text-xs text-muted-foreground">
                            {product.sku || product.id}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell className="text-center tabular-nums text-muted-foreground">
                        {product.expectedQty}
                      </TableCell>
                      <TableCell>
                        <Counter
                          value={counted}
                          disabled={checked}
                          onChange={(v) => setCount(product.id, v)}
                          onStep={(d) => updateProductCount(product.id, d)}
                          onExpected={() =>
                            setToExpectedQty(product.id, product.expectedQty)
                          }
                        />
                      </TableCell>
                      <TableCell className="text-center">
                        <VarianceBadge variance={variance} show={checked} />
                      </TableCell>
                      <TableCell className="text-right">
                        <CheckButton
                          checked={checked}
                          onClick={() => handleProductCheck(product.id)}
                        />
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </Card>

          {/* Mobile: cards */}
          <div className="grid grid-cols-1 gap-3 md:hidden">
            {visibleProducts.map((product) => {
              const checked = checkedProducts.has(product.id);
              const counted = productCounts[product.id] || 0;
              const variance = counted - (product.expectedQty || 0);
              return (
                <div
                  key={product.id}
                  className={cn(
                    "rounded-xl border bg-card p-4 shadow-sm transition-colors",
                    checked && "border-primary/30 bg-primary/[0.04]"
                  )}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="font-medium leading-tight">{product.name}</p>
                      <p className="font-mono text-xs text-muted-foreground">
                        {product.sku || product.id}
                      </p>
                    </div>
                    <VarianceBadge variance={variance} show={checked} />
                  </div>

                  <div className="mt-4 flex items-center justify-between gap-3">
                    <div className="text-xs text-muted-foreground">
                      Forventet
                      <span className="ml-1.5 font-medium tabular-nums text-foreground">
                        {product.expectedQty}
                      </span>
                    </div>
                    <Counter
                      value={counted}
                      disabled={checked}
                      onChange={(v) => setCount(product.id, v)}
                      onStep={(d) => updateProductCount(product.id, d)}
                      onExpected={() =>
                        setToExpectedQty(product.id, product.expectedQty)
                      }
                    />
                  </div>

                  <CheckButton
                    checked={checked}
                    full
                    onClick={() => handleProductCheck(product.id)}
                    className="mt-4"
                  />
                </div>
              );
            })}
          </div>
        </>
      )}

      {/* Sticky progress + complete */}
      <div className="sticky bottom-4 z-10">
        <div className="space-y-3 rounded-xl border bg-card/90 p-4 shadow-lg backdrop-blur supports-[backdrop-filter]:bg-card/75">
          <div className="flex items-center justify-between gap-3 text-sm">
            <span className="font-medium">
              <span className="tabular-nums">{checkedAll}</span>
              <span className="text-muted-foreground">
                {" "}
                af <span className="tabular-nums">{totalAll}</span> varer talt
              </span>
            </span>
            <span className="tabular-nums text-muted-foreground">
              {Math.round(progressPercentage)}%
            </span>
          </div>
          <Progress value={progressPercentage} />
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-xs text-muted-foreground">
              {isAllChecked
                ? "Alle varer er talt. Du kan afslutte lagerstatussen."
                : "Tæl alle varer på alle lokationer for at afslutte."}
            </p>
            <Button
              className="w-full sm:w-auto"
              onClick={completeStocktake}
              disabled={!isAllChecked || isCompleting}
            >
              {isCompleting ? (
                <>
                  <LoadingSpinner size="sm" className="text-current" />
                  Afslutter...
                </>
              ) : (
                <>
                  <CheckCircle2 />
                  Afslut lagerstatus
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

function PageHeader({ initials }: { initials: string }) {
  return (
    <header className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div className="space-y-3">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="size-4" aria-hidden />
          Tilbage til oversigt
        </Link>
        <div>
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
            Optælling
          </h1>
          <p className="text-sm text-muted-foreground">
            Tæl varerne og bekræft hver linje.
          </p>
        </div>
      </div>
      {initials && (
        <div className="inline-flex items-center gap-2 self-start rounded-full border bg-muted/50 px-3 py-1.5 text-sm sm:self-auto">
          <span className="flex size-6 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold uppercase text-primary">
            {initials.slice(0, 2)}
          </span>
          <span className="text-muted-foreground">Tæller op</span>
        </div>
      )}
    </header>
  );
}

interface CounterProps {
  value: number;
  disabled?: boolean;
  onChange: (value: number) => void;
  onStep: (delta: number) => void;
  onExpected: () => void;
}

function Counter({ value, disabled, onChange, onStep, onExpected }: CounterProps) {
  return (
    <div className="flex items-center justify-center gap-1.5">
      <Button
        type="button"
        size="icon"
        variant="outline"
        className="size-9 active:scale-95"
        onClick={() => onStep(-1)}
        disabled={disabled || value <= 0}
        aria-label="Træk én fra"
      >
        <Minus />
      </Button>
      <Input
        value={value}
        disabled={disabled}
        inputMode="numeric"
        aria-label="Optalt antal"
        onChange={(e) => {
          const n = parseInt(e.target.value.replace(/\D/g, ""), 10);
          onChange(Number.isNaN(n) ? 0 : n);
        }}
        className="h-9 w-14 px-1 text-center font-medium tabular-nums"
      />
      <Button
        type="button"
        size="icon"
        variant="outline"
        className="size-9 active:scale-95"
        onClick={() => onStep(1)}
        disabled={disabled}
        aria-label="Læg én til"
      >
        <Plus />
      </Button>
      <Button
        type="button"
        size="icon"
        variant="ghost"
        className="size-9 text-muted-foreground"
        onClick={onExpected}
        disabled={disabled}
        title="Sæt til forventet antal"
        aria-label="Sæt til forventet antal"
      >
        <Equal />
      </Button>
    </div>
  );
}

function VarianceBadge({ variance, show }: { variance: number; show: boolean }) {
  if (!show) {
    return <span className="text-sm text-muted-foreground">—</span>;
  }
  if (variance === 0) {
    return (
      <span className="inline-flex items-center gap-1 text-sm font-medium text-primary">
        <Check className="size-3.5" aria-hidden />0
      </span>
    );
  }
  const positive = variance > 0;
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-md px-1.5 py-0.5 text-sm font-semibold tabular-nums",
        positive
          ? "bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300"
          : "bg-red-100 text-red-700 dark:bg-red-500/15 dark:text-red-300"
      )}
    >
      {positive ? `+${variance}` : variance}
    </span>
  );
}

interface CheckButtonProps {
  checked: boolean;
  onClick: () => void;
  full?: boolean;
  className?: string;
}

function CheckButton({ checked, onClick, full, className }: CheckButtonProps) {
  return (
    <Button
      size="sm"
      variant={checked ? "outline" : "default"}
      onClick={onClick}
      className={cn(full ? "w-full" : "min-w-24", className)}
    >
      {checked ? (
        <>
          <Undo2 />
          Fortryd
        </>
      ) : (
        <>
          <Check />
          Bekræft
        </>
      )}
    </Button>
  );
}

function EmptyState({ hasProducts }: { hasProducts: boolean }) {
  return (
    <Card className="items-center gap-3 py-12 text-center">
      <div className="flex size-12 items-center justify-center rounded-full bg-muted">
        <PackageSearch className="size-6 text-muted-foreground" aria-hidden />
      </div>
      <p className="text-sm text-muted-foreground">
        {hasProducts
          ? "Ingen varer matcher din søgning på denne lokation."
          : "Ingen varer på denne lokation."}
      </p>
    </Card>
  );
}
