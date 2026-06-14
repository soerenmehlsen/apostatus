"use client";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  ClipboardList,
  MapPin,
  Package,
  Upload,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { getLocationName } from "@/lib/dashboard-display";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface Location {
  id: string;
  name: string;
}

interface UploadedFile {
  id: string;
  filename: string;
  uploadDate: string;
  location: string;
  productCount: number;
}

interface NewStocktakeClientProps {
  initialLocations?: Location[];
  initialFiles?: UploadedFile[];
}

/** A location enriched with how many files/products are available to count. */
interface LocationOption {
  id: string;
  name: string;
  productCount: number;
  fileCount: number;
  disabled: boolean;
}

export default function NewStocktakeClient({
  initialLocations = [],
  initialFiles = [],
}: NewStocktakeClientProps) {
  const [selectedLocations, setSelectedLocations] = useState<string[]>([]);
  const router = useRouter();
  const [locations, setLocations] = useState<Location[]>(initialLocations);
  const [uploadedFiles, setUploadedFiles] =
    useState<UploadedFile[]>(initialFiles);
  const [isLoading, setIsLoading] = useState(!initialLocations.length);
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    if (!initialLocations.length || !initialFiles.length) {
      fetchData();
    }
  }, [initialLocations.length, initialFiles.length]);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/newstocktake");
      const data = await response.json();

      if (response.ok) {
        setLocations(data.locations || []);
        setUploadedFiles(data.files || []);
      } else {
        toast.error("Kunne ikke hente data", {
          description: data.error,
        });
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error("Kunne ikke hente data", {
        description: "Prøv venligst igen senere.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Enrich each location with its available files/products.
  const options = useMemo<LocationOption[]>(() => {
    return locations.map((location) => {
      const files = uploadedFiles.filter((f) => f.location === location.id);
      const productCount = files.reduce((sum, f) => sum + f.productCount, 0);
      return {
        id: location.id,
        name: location.name || getLocationName(location.id),
        productCount,
        fileCount: files.length,
        disabled: productCount === 0,
      };
    });
  }, [locations, uploadedFiles]);

  const selectableOptions = useMemo(
    () => options.filter((o) => !o.disabled),
    [options]
  );
  const hasDisabledOptions = options.some((o) => o.disabled);

  const selectedSummary = useMemo(() => {
    const chosen = options.filter((o) => selectedLocations.includes(o.id));
    const totalProducts = chosen.reduce((sum, o) => sum + o.productCount, 0);
    return { count: chosen.length, totalProducts };
  }, [options, selectedLocations]);

  const allSelectableSelected =
    selectableOptions.length > 0 &&
    selectableOptions.every((o) => selectedLocations.includes(o.id));

  const toggleLocation = (id: string) => {
    setSelectedLocations((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    setSelectedLocations(
      allSelectableSelected ? [] : selectableOptions.map((o) => o.id)
    );
  };

  const canStart = selectedLocations.length > 0 && !isCreating;

  const handleStartStocktake = async () => {
    if (!canStart) {
      toast.error("Mangler oplysninger", {
        description: "Vælg mindst én lokation for at starte.",
      });
      return;
    }

    setIsCreating(true);

    try {
      const response = await fetch("/api/newsession", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: "Stocktake",
          locations: selectedLocations,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        const params = new URLSearchParams({
          sessionId: data.data.sessionId,
          locations: selectedLocations.join(","),
        });

        toast.success("Lagerstatus oprettet", {
          description: "Sender dig videre til optælling...",
        });

        router.push(`/stocktake/check?${params.toString()}`);
      } else {
        toast.error("Kunne ikke oprette lagerstatus", {
          description: data.error,
        });
      }
    } catch (error) {
      console.error("Error creating stocktake:", error);
      toast.error("Kunne ikke oprette lagerstatus", {
        description: "Prøv venligst igen senere.",
      });
    } finally {
      setIsCreating(false);
    }
  };

  if (isLoading) {
    return (
      <div className="mx-auto w-full max-w-4xl space-y-8">
        <PageHeader />
        <Card className="items-center gap-3 py-16 text-center">
          <LoadingSpinner size="lg" />
          <p className="text-sm text-muted-foreground">Henter lokationer...</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-4xl space-y-8 pb-28 sm:pb-8">
      <PageHeader />

      {/* Step 1 — pick locations */}
      <section className="space-y-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <StepHeading
            step={1}
            icon={MapPin}
            title="Vælg lokationer"
            description="Vælg de lokationer der skal tælles op i denne status."
          />
          {selectableOptions.length > 0 && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={toggleSelectAll}
              disabled={isCreating}
              className="self-start text-muted-foreground sm:self-auto"
            >
              {allSelectableSelected ? "Ryd valg" : "Vælg alle"}
            </Button>
          )}
        </div>

        {options.length === 0 ? (
          <EmptyState />
        ) : (
          <>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {options.map((option) => (
                <LocationOptionCard
                  key={option.id}
                  option={option}
                  selected={selectedLocations.includes(option.id)}
                  disabled={isCreating}
                  onToggle={() => toggleLocation(option.id)}
                />
              ))}
            </div>
            {hasDisabledOptions && (
              <p className="text-xs text-muted-foreground">
                Lokationer uden filer er deaktiveret.{" "}
                <Link
                  href="/upload"
                  className="font-medium text-primary underline-offset-4 hover:underline"
                >
                  Upload filer
                </Link>{" "}
                for at aktivere dem.
              </p>
            )}
          </>
        )}
      </section>

      {/* Summary + primary action */}
      {options.length > 0 && (
        <div className="sticky bottom-4 z-10">
          <div className="flex flex-col gap-3 rounded-xl border bg-card/90 p-4 shadow-lg backdrop-blur supports-[backdrop-filter]:bg-card/75 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3 text-sm">
              <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Package className="size-5" aria-hidden />
              </span>
              {selectedSummary.count === 0 ? (
                <span className="text-muted-foreground">
                  Vælg mindst én lokation for at starte.
                </span>
              ) : (
                <span className="text-foreground">
                  <span className="font-semibold tabular-nums">
                    {selectedSummary.count}
                  </span>{" "}
                  {selectedSummary.count === 1 ? "lokation" : "lokationer"}
                  <span className="text-muted-foreground">
                    {" · "}
                    <span className="tabular-nums">
                      {selectedSummary.totalProducts}
                    </span>{" "}
                    {selectedSummary.totalProducts === 1 ? "vare" : "varer"}
                  </span>
                </span>
              )}
            </div>
            <Button
              size="lg"
              className="w-full sm:w-auto"
              disabled={!canStart}
              onClick={handleStartStocktake}
            >
              {isCreating ? (
                <>
                  <LoadingSpinner size="sm" className="text-current" />
                  Opretter...
                </>
              ) : (
                <>
                  Start optælling
                  <ArrowRight />
                </>
              )}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

function PageHeader() {
  return (
    <header className="space-y-3">
      <Link
        href="/dashboard"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="size-4" aria-hidden />
        Tilbage til oversigt
      </Link>
      <div className="flex items-start gap-3">
        <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <ClipboardList className="size-6" aria-hidden />
        </span>
        <div className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
            Ny lagerstatus
          </h1>
          <p className="text-sm text-muted-foreground">
            Vælg hvilke lokationer der skal med i denne status.
          </p>
        </div>
      </div>
    </header>
  );
}

interface StepHeadingProps {
  step: number;
  icon: React.ComponentType<{ className?: string; "aria-hidden"?: boolean }>;
  title: string;
  description: string;
}

function StepHeading({ step, icon: Icon, title, description }: StepHeadingProps) {
  return (
    <div className="flex items-center gap-3">
      <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-muted text-sm font-semibold tabular-nums text-muted-foreground">
        {step}
      </span>
      <div className="space-y-0.5">
        <h2 className="flex items-center gap-2 text-lg font-semibold tracking-tight">
          <Icon className="size-4 text-muted-foreground" aria-hidden />
          {title}
        </h2>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
    </div>
  );
}

interface LocationOptionCardProps {
  option: LocationOption;
  selected: boolean;
  disabled: boolean;
  onToggle: () => void;
}

function LocationOptionCard({
  option,
  selected,
  disabled,
  onToggle,
}: LocationOptionCardProps) {
  const isDisabled = disabled || option.disabled;

  return (
    <button
      type="button"
      onClick={onToggle}
      disabled={isDisabled}
      aria-pressed={selected}
      className={cn(
        "group relative flex flex-col gap-3 rounded-xl border p-4 text-left transition-all outline-none",
        "focus-visible:ring-[3px] focus-visible:ring-ring/50",
        option.disabled
          ? "cursor-not-allowed border-dashed bg-muted/40 opacity-60"
          : selected
            ? "border-primary bg-primary/5 shadow-sm ring-1 ring-primary"
            : "bg-card hover:border-primary/40 hover:bg-accent/40 hover:shadow-sm",
        disabled && !option.disabled && "pointer-events-none opacity-60"
      )}
    >
      <span
        className={cn(
          "absolute right-3 top-3 flex size-5 items-center justify-center rounded-full border transition-colors",
          selected
            ? "border-primary bg-primary text-primary-foreground"
            : "border-muted-foreground/25 text-transparent group-hover:border-muted-foreground/50"
        )}
        aria-hidden
      >
        <Check className="size-3.5" />
      </span>

      <span
        className={cn(
          "flex size-10 items-center justify-center rounded-lg text-base font-bold tabular-nums transition-colors",
          selected
            ? "bg-primary/15 text-primary"
            : "bg-muted text-muted-foreground"
        )}
      >
        {option.id}
      </span>

      <div className="min-w-0 space-y-0.5">
        <p className="truncate text-sm font-semibold leading-tight">
          {option.name}
        </p>
        <p className="text-xs text-muted-foreground tabular-nums">
          {option.disabled
            ? "Ingen filer"
            : `${option.productCount} varer · ${option.fileCount} ${
                option.fileCount === 1 ? "fil" : "filer"
              }`}
        </p>
      </div>
    </button>
  );
}

function EmptyState() {
  return (
    <Card className="items-center gap-3 py-12 text-center">
      <div className="flex size-12 items-center justify-center rounded-full bg-muted">
        <Upload className="size-6 text-muted-foreground" aria-hidden />
      </div>
      <div className="space-y-3">
        <p className="text-sm text-muted-foreground">
          Ingen lokationer tilgængelige endnu. Upload CSV-filer for at komme i
          gang.
        </p>
        <Button asChild>
          <Link href="/upload">
            <Upload />
            Upload filer
          </Link>
        </Button>
      </div>
    </Card>
  );
}
