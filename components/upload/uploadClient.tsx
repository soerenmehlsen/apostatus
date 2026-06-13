"use client";
import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, FileText, Trash2, Upload, UploadCloud } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { EmptyState } from "@/components/ui/empty-state";
import { formatDateDa, getLocationName } from "@/lib/dashboard-display";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface UploadedFile {
  id: string;
  filename: string;
  uploadDate: string;
  location: string;
  products?: unknown[];
}

interface UploadClientProps {
  initialFiles?: UploadedFile[];
}

export default function UploadClient({ initialFiles = [] }: UploadClientProps) {
  const [uploadedFiles, setUploadedFiles] =
    useState<UploadedFile[]>(initialFiles);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const handleFileUpload = async (files: FileList) => {
    if (files.length === 0) return;

    setIsUploading(true);
    setUploadProgress(0);

    const formData = new FormData();
    Array.from(files).forEach((file) => {
      formData.append("files", file);
    });

    try {
      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const result = await response.json();

      if (response.ok) {
        for (let i = 0; i <= 100; i += 10) {
          setUploadProgress(i);
          await new Promise((resolve) => setTimeout(resolve, 50));
        }

        await fetchUploadedFiles();

        toast.success("Filer uploadet", {
          description: result.message,
          duration: 3000,
        });
      } else {
        toast.error("Upload mislykkedes", {
          description: result.error,
        });
      }
    } catch {
      toast.error("Upload mislykkedes", {
        description: "Der opstod en fejl under upload.",
      });
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const fetchUploadedFiles = async () => {
    try {
      const response = await fetch("/api/upload");
      const data = await response.json();
      setUploadedFiles(data.files || []);
    } catch (error) {
      console.error("Failed to fetch files:", error);
      toast.error("Kunne ikke hente filer");
    }
  };

  const deleteFile = async (fileId: string) => {
    try {
      const response = await fetch(`/api/upload?id=${fileId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setUploadedFiles((prev) => prev.filter((file) => file.id !== fileId));
        toast.success("Fil slettet", {
          description: "Filen er fjernet.",
        });
      } else {
        toast.error("Sletning mislykkedes", {
          description: "Kunne ikke slette filen.",
        });
      }
    } catch {
      toast.error("Sletning mislykkedes", {
        description: "Kunne ikke slette filen.",
      });
    }
  };

  const openFilePicker = () => fileInputRef.current?.click();

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (isUploading) return;
    handleFileUpload(e.dataTransfer.files);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    if (!isUploading) setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  useEffect(() => {
    if (initialFiles.length === 0) {
      fetchUploadedFiles();
    }
  }, [initialFiles.length]);

  return (
    <div className="mx-auto w-full max-w-4xl space-y-8 pb-8">
      <PageHeader />

      {/* Dropzone */}
      <section className="space-y-3">
        <button
          type="button"
          onClick={openFilePicker}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          disabled={isUploading}
          className={cn(
            "flex w-full flex-col items-center gap-4 rounded-xl border-2 border-dashed p-8 text-center transition-colors outline-none sm:p-12",
            "focus-visible:ring-[3px] focus-visible:ring-ring/50",
            isDragging
              ? "border-primary bg-primary/5"
              : "border-border bg-card hover:border-primary/40 hover:bg-accent/40",
            isUploading && "pointer-events-none opacity-60"
          )}
        >
          <span
            className={cn(
              "flex size-14 items-center justify-center rounded-full transition-colors",
              isDragging
                ? "bg-primary/15 text-primary"
                : "bg-muted text-muted-foreground"
            )}
          >
            <UploadCloud className="size-7" aria-hidden />
          </span>
          <div className="space-y-1">
            <p className="text-base font-semibold">
              Træk og slip dine CSV-filer her
            </p>
            <p className="text-sm text-muted-foreground">
              eller{" "}
              <span className="font-medium text-primary">klik for at vælge</span>
              . Du kan uploade flere filer på én gang. Hver fil med lagerdata
              for en lokation.
            </p>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept=".csv"
            onChange={(e) => e.target.files && handleFileUpload(e.target.files)}
            className="hidden"
          />
        </button>

        {isUploading && (
          <div className="space-y-2 rounded-lg border bg-card p-4">
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium">Uploader filer...</span>
              <span className="text-muted-foreground tabular-nums">
                {uploadProgress}%
              </span>
            </div>
            <Progress value={uploadProgress} className="h-2" />
          </div>
        )}
      </section>

      {/* Uploaded files */}
      <section className="space-y-4">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-lg font-semibold tracking-tight">
            Uploadede filer
          </h2>
          {uploadedFiles.length > 0 && (
            <Badge variant="secondary" className="tabular-nums">
              {uploadedFiles.length}{" "}
              {uploadedFiles.length === 1 ? "fil" : "filer"}
            </Badge>
          )}
        </div>

        {uploadedFiles.length === 0 ? (
          <Card className="py-2">
            <EmptyState
              icon={<FileText className="size-10" aria-hidden />}
              title="Ingen filer endnu"
              description="Upload en CSV-fil ovenfor for at komme i gang med en lagerstatus."
            />
          </Card>
        ) : (
          <>
            {/* Desktop: table */}
            <Card className="hidden overflow-hidden p-0 sm:block">
              <Table className="table-fixed [&_td]:px-4 [&_td]:py-3 [&_th]:px-4">
                <TableHeader>
                  <TableRow className="bg-muted/40 hover:bg-muted/40">
                    <TableHead>Filnavn</TableHead>
                    <TableHead className="w-[180px]">Lokation</TableHead>
                    <TableHead className="w-[88px] text-right">Varer</TableHead>
                    <TableHead className="w-[130px]">Uploadet</TableHead>
                    <TableHead className="w-[72px] text-right">
                      <span className="sr-only">Handling</span>
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {uploadedFiles.map((file) => (
                    <TableRow key={file.id}>
                      <TableCell className="font-medium">
                        <span className="flex min-w-0 items-center gap-2">
                          <FileText
                            className="size-4 shrink-0 text-muted-foreground"
                            aria-hidden
                          />
                          <span className="truncate">{file.filename}</span>
                        </span>
                      </TableCell>
                      <TableCell>
                        <LocationLabel location={file.location} />
                      </TableCell>
                      <TableCell className="text-right tabular-nums">
                        {file.products?.length || 0}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {isClient ? formatDateDa(file.uploadDate) : "—"}
                      </TableCell>
                      <TableCell className="text-right">
                        <DeleteButton onDelete={() => deleteFile(file.id)} />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>

            {/* Mobile: cards */}
            <div className="space-y-3 sm:hidden">
              {uploadedFiles.map((file) => (
                <Card key={file.id} className="gap-3 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex min-w-0 items-center gap-2">
                      <FileText
                        className="size-4 shrink-0 text-muted-foreground"
                        aria-hidden
                      />
                      <span className="truncate text-sm font-medium">
                        {file.filename}
                      </span>
                    </div>
                    <DeleteButton onDelete={() => deleteFile(file.id)} />
                  </div>
                  <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                    <LocationLabel location={file.location} />
                    <span className="tabular-nums">
                      {file.products?.length || 0} varer
                    </span>
                    <span aria-hidden>·</span>
                    <span>{isClient ? formatDateDa(file.uploadDate) : "—"}</span>
                  </div>
                </Card>
              ))}
            </div>
          </>
        )}
      </section>
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
          <Upload className="size-6" aria-hidden />
        </span>
        <div className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
            Upload filer
          </h1>
          <p className="text-sm text-muted-foreground">
            Upload CSV-filer med lagerdata for hver lokation.
          </p>
        </div>
      </div>
    </header>
  );
}

function LocationLabel({ location }: { location: string }) {
  const name = getLocationName(location);
  const showCode = name !== location;
  return (
    <span className="inline-flex items-center gap-2">
      <Badge variant="outline" className="font-medium">
        {name}
      </Badge>
      {showCode && (
        <span className="text-xs text-muted-foreground tabular-nums">
          {location}
        </span>
      )}
    </span>
  );
}

function DeleteButton({ onDelete }: { onDelete: () => void }) {
  return (
    <Button
      size="icon"
      variant="ghost"
      onClick={onDelete}
      aria-label="Slet fil"
      className="text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
    >
      <Trash2 className="size-4" />
    </Button>
  );
}
