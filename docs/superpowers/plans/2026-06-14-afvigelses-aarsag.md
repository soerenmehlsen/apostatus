# Årsag ved afvigelse i optælling — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Lade medarbejderen vælge en påkrævet årsag (dropdown) når en optalt linje afviger fra forventet, og vise årsagen igen under review og i arkivet.

**Architecture:** Et nyt nullable `reason`-felt på `StockCheck`. Årsager er en kode→label-konstant i `types/api.ts`. Ved bekræft af en linje med afvigelse åbnes en dialog (ny shadcn `Dialog`-primitiv oven på `@radix-ui/react-dialog`) med en Radix `Select`; linjen gemmes først når en årsag er valgt. Årsagen persisteres via den eksisterende saveproduct-route og vises på review- og arkiv-siderne.

**Tech Stack:** Next.js 16 App Router, React 19, TypeScript, Prisma 6 (Azure SQL), Tailwind 4, Radix UI, shadcn-stil primitiver.

**Note om verifikation:** Projektet har ingen testsuite (jf. CLAUDE.md). Hver opgave verificeres med `npm run lint` og `npm run build`. `npm run db:generate` skal køres efter skema-ændring så Prisma-klienten kender `reason`-feltet (ellers fejler TypeScript-build af route-ændringerne). `npm run db:push` kræver forbindelse til databasen.

---

## Task 1: Tilføj `reason` til StockCheck-skemaet

**Files:**
- Modify: `prisma/schema.prisma:62-80`

- [ ] **Step 1: Tilføj feltet til StockCheck-modellen**

I `prisma/schema.prisma`, tilføj `reason String?` i `StockCheck`-modellen efter `status`-linjen:

```prisma
model StockCheck {
  id          String           @id @default(cuid())
  productId   String
  sessionId   String
  expectedQty Int
  countedQty  Int
  variance    Int
  checkedAt   DateTime         @default(now())
  checkedBy   String?
  status      String
  reason      String?
  product     Product          @relation(fields: [productId], references: [id], onDelete: Cascade)
  session     StocktakeSession @relation(fields: [sessionId], references: [id], onUpdate: NoAction)

  @@unique([productId, sessionId])
  @@index([sessionId])
  @@index([status])
  @@index([checkedAt])
  @@map("stock_checks")
}
```

- [ ] **Step 2: Push skemaet til databasen**

Run: `npm run db:push`
Expected: "Your database is now in sync with your Prisma schema." (kræver DB-forbindelse)

- [ ] **Step 3: Regenerér Prisma-klienten**

Run: `npm run db:generate`
Expected: "Generated Prisma Client" — klienten kender nu `reason` på `StockCheck`.

- [ ] **Step 4: Verificér typegenerering**

Run: `npx tsc --noEmit`
Expected: Ingen fejl (eller kun fejl der ikke vedrører `reason`).

- [ ] **Step 5: Commit**

```bash
git add prisma/schema.prisma
git commit -m "feat: add reason field to StockCheck"
```

---

## Task 2: Definér årsags-konstant og label-helper

**Files:**
- Modify: `types/api.ts` (efter `LOCATION_MAP`, omkring linje 96)
- Modify: `lib/dashboard-display.ts` (efter `getLocationNames`, omkring linje 69)

- [ ] **Step 1: Tilføj VARIANCE_REASON_MAP og VARIANCE_REASONS i `types/api.ts`**

Tilføj nederst i filen (eller direkte efter `LOCATION_MAP`-blokken):

```ts
// Faste årsager til lagerafvigelse. Kode gemmes på StockCheck.reason; label vises i UI.
export const VARIANCE_REASON_MAP: Record<string, string> = {
  shrinkage: 'Svind/tyveri',
  disposal: 'Kassation (udløbet/beskadiget)',
  registration_error: 'Registreringsfejl',
  delivery_error: 'Fejl i levering',
} as const;

// Bevarer rækkefølgen til dropdown-visning.
export const VARIANCE_REASONS: { code: string; label: string }[] = Object.entries(
  VARIANCE_REASON_MAP
).map(([code, label]) => ({ code, label }));
```

- [ ] **Step 2: Tilføj `getVarianceReasonLabel` i `lib/dashboard-display.ts`**

Opdater importen øverst i filen så den også henter `VARIANCE_REASON_MAP`:

```ts
import { LOCATION_MAP, VARIANCE_REASON_MAP } from "@/types/api";
```

Tilføj efter `getLocationNames`:

```ts
export function getVarianceReasonLabel(code: string | null | undefined): string {
  if (!code) return "";
  return VARIANCE_REASON_MAP[code] ?? code;
}
```

- [ ] **Step 3: Verificér**

Run: `npm run lint`
Expected: Ingen nye fejl.

- [ ] **Step 4: Commit**

```bash
git add types/api.ts lib/dashboard-display.ts
git commit -m "feat: add variance reason constants and label helper"
```

---

## Task 3: Tilføj Radix Dialog-dependency og shadcn Dialog-primitiv

**Files:**
- Modify: `package.json`
- Create: `components/ui/dialog.tsx`

- [ ] **Step 1: Installér `@radix-ui/react-dialog`**

Run: `npm install @radix-ui/react-dialog`
Expected: Pakken tilføjes til `dependencies` i `package.json`.

- [ ] **Step 2: Opret `components/ui/dialog.tsx`**

```tsx
"use client"

import * as React from "react"
import * as DialogPrimitive from "@radix-ui/react-dialog"
import { XIcon } from "lucide-react"

import { cn } from "@/lib/utils"

function Dialog(props: React.ComponentProps<typeof DialogPrimitive.Root>) {
  return <DialogPrimitive.Root data-slot="dialog" {...props} />
}

function DialogTrigger(
  props: React.ComponentProps<typeof DialogPrimitive.Trigger>
) {
  return <DialogPrimitive.Trigger data-slot="dialog-trigger" {...props} />
}

function DialogPortal(
  props: React.ComponentProps<typeof DialogPrimitive.Portal>
) {
  return <DialogPrimitive.Portal data-slot="dialog-portal" {...props} />
}

function DialogClose(props: React.ComponentProps<typeof DialogPrimitive.Close>) {
  return <DialogPrimitive.Close data-slot="dialog-close" {...props} />
}

function DialogOverlay({
  className,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Overlay>) {
  return (
    <DialogPrimitive.Overlay
      data-slot="dialog-overlay"
      className={cn(
        "data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 fixed inset-0 z-50 bg-black/50",
        className
      )}
      {...props}
    />
  )
}

function DialogContent({
  className,
  children,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Content>) {
  return (
    <DialogPortal>
      <DialogOverlay />
      <DialogPrimitive.Content
        data-slot="dialog-content"
        className={cn(
          "bg-background data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 fixed top-[50%] left-[50%] z-50 grid w-full max-w-[calc(100%-2rem)] translate-x-[-50%] translate-y-[-50%] gap-4 rounded-xl border p-6 shadow-lg duration-200 sm:max-w-md",
          className
        )}
        {...props}
      >
        {children}
        <DialogPrimitive.Close className="ring-offset-background focus:ring-ring absolute top-4 right-4 rounded-xs opacity-70 transition-opacity hover:opacity-100 focus:ring-2 focus:ring-offset-2 focus:outline-none disabled:pointer-events-none">
          <XIcon className="size-4" />
          <span className="sr-only">Luk</span>
        </DialogPrimitive.Close>
      </DialogPrimitive.Content>
    </DialogPortal>
  )
}

function DialogHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="dialog-header"
      className={cn("flex flex-col gap-2 text-center sm:text-left", className)}
      {...props}
    />
  )
}

function DialogFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="dialog-footer"
      className={cn(
        "flex flex-col-reverse gap-2 sm:flex-row sm:justify-end",
        className
      )}
      {...props}
    />
  )
}

function DialogTitle({
  className,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Title>) {
  return (
    <DialogPrimitive.Title
      data-slot="dialog-title"
      className={cn("text-lg font-semibold leading-none", className)}
      {...props}
    />
  )
}

function DialogDescription({
  className,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Description>) {
  return (
    <DialogPrimitive.Description
      data-slot="dialog-description"
      className={cn("text-muted-foreground text-sm", className)}
      {...props}
    />
  )
}

export {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogOverlay,
  DialogPortal,
  DialogTitle,
  DialogTrigger,
}
```

- [ ] **Step 3: Verificér**

Run: `npm run lint`
Expected: Ingen nye fejl.

- [ ] **Step 4: Commit**

```bash
git add package.json package-lock.json components/ui/dialog.tsx
git commit -m "feat: add shadcn dialog primitive"
```

---

## Task 4: Byg VarianceReasonDialog-komponenten

**Files:**
- Create: `components/stocktake/varianceReasonDialog.tsx`

- [ ] **Step 1: Opret komponenten**

```tsx
"use client";

import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { VARIANCE_REASONS } from "@/types/api";

interface VarianceReasonProduct {
  id: string;
  name: string;
  sku: string;
  expectedQty: number;
  countedQty: number;
}

interface VarianceReasonDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  product: VarianceReasonProduct | null;
  /** Forudfyldt årsagskode ved genåbning af en linje, ellers null. */
  initialReason: string | null;
  onConfirm: (reason: string) => void;
}

export default function VarianceReasonDialog({
  open,
  onOpenChange,
  product,
  initialReason,
  onConfirm,
}: VarianceReasonDialogProps) {
  const [reason, setReason] = useState<string>(initialReason ?? "");

  // Genstil valget hver gang dialogen åbnes for en (ny) linje.
  useEffect(() => {
    if (open) {
      setReason(initialReason ?? "");
    }
  }, [open, initialReason, product?.id]);

  if (!product) return null;

  const variance = product.countedQty - product.expectedQty;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Vælg årsag til afvigelse</DialogTitle>
          <DialogDescription>
            {product.name} ({product.sku})
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-3 gap-2 rounded-lg border bg-muted/40 p-3 text-center text-sm">
          <div>
            <p className="text-xs text-muted-foreground">Forventet</p>
            <p className="font-medium tabular-nums">{product.expectedQty}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Optalt</p>
            <p className="font-medium tabular-nums">{product.countedQty}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Afvigelse</p>
            <p className="font-semibold tabular-nums">
              {variance > 0 ? `+${variance}` : variance}
            </p>
          </div>
        </div>

        <Select value={reason} onValueChange={setReason}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Vælg en årsag..." />
          </SelectTrigger>
          <SelectContent>
            {VARIANCE_REASONS.map((r) => (
              <SelectItem key={r.code} value={r.code}>
                {r.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Annullér
          </Button>
          <Button disabled={!reason} onClick={() => onConfirm(reason)}>
            Bekræft
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
```

- [ ] **Step 2: Verificér**

Run: `npm run lint`
Expected: Ingen nye fejl.

- [ ] **Step 3: Commit**

```bash
git add components/stocktake/varianceReasonDialog.tsx
git commit -m "feat: add variance reason dialog component"
```

---

## Task 5: Wire dialog og årsags-state ind i stockCheckClient

**Files:**
- Modify: `components/stocktake/stockCheckClient.tsx`

- [ ] **Step 1: Importér dialog-komponenten**

Tilføj efter de øvrige imports (omkring linje 31):

```tsx
import VarianceReasonDialog from "@/components/stocktake/varianceReasonDialog";
```

- [ ] **Step 2: Udvid `StockCheckData` og `ExistingCheck` med `reason`**

Erstat de to interfaces (linje 42-59):

```tsx
interface StockCheckData {
  productId: string;
  sessionId: string;
  expectedQty: number;
  countedQty: number;
  variance: number;
  checkedBy: string;
  status: string;
  reason: string | null;
}

interface ExistingCheck {
  productId: string;
  countedQty: number;
  expectedQty: number;
  variance: number;
  checkedBy: string | null;
  status: string;
  reason: string | null;
}
```

- [ ] **Step 3: Tilføj state for årsager og for dialogen**

Efter `checkedProducts`-state (omkring linje 81), tilføj:

```tsx
  const [productReasons, setProductReasons] = useState<Record<string, string>>(
    () =>
      Object.fromEntries(
        initialChecks
          .filter((c) => c.reason)
          .map((c) => [c.productId, c.reason as string])
      )
  );
  const [reasonDialog, setReasonDialog] = useState<{
    open: boolean;
    productId: string | null;
  }>({ open: false, productId: null });
```

- [ ] **Step 4: Hydrér årsager ved genoptagelse**

Erstat `hydrateChecks` (linje 107-112) så den også sætter `productReasons`:

```tsx
  const hydrateChecks = useCallback((checks: ExistingCheck[]) => {
    if (!checks.length) return;
    setProductCounts(Object.fromEntries(checks.map((c) => [c.productId, c.countedQty])));
    setCheckedProducts(new Set(checks.map((c) => c.productId)));
    setProductReasons(
      Object.fromEntries(
        checks.filter((c) => c.reason).map((c) => [c.productId, c.reason as string])
      )
    );
    setInitials((prev) => prev || (checks.find((c) => c.checkedBy)?.checkedBy ?? ""));
  }, []);
```

- [ ] **Step 5: Lad `buildCheck` medtage årsag (med override)**

Erstat `buildCheck` (linje 169-183):

```tsx
  // Build the saved-check payload for a single product from current state.
  // reasonOverride is passed straight after a dialog confirm to avoid reading
  // not-yet-committed reason state.
  const buildCheck = (
    productId: string,
    reasonOverride?: string
  ): StockCheckData | null => {
    const product = products.find((p) => p.id === productId);
    if (!product) return null;
    const countedQty = productCounts[productId] || 0;
    const expectedQty = product.expectedQty || 0;
    const variance = countedQty - expectedQty;
    return {
      productId,
      sessionId,
      expectedQty,
      countedQty,
      variance,
      checkedBy: initials,
      status: "checked",
      reason:
        variance !== 0
          ? reasonOverride ?? productReasons[productId] ?? null
          : null,
    };
  };
```

- [ ] **Step 6: Udtræk en `persistCheck`-funktion og opdel `handleProductCheck`**

Erstat hele `handleProductCheck` (linje 200-253) med en delt persist-funktion plus en tynd handler der åbner dialogen ved afvigelse:

```tsx
  // Persist a single confirmed line. Optimistically marks it checked, then
  // saves immediately so the count survives leaving and resuming.
  const persistCheck = async (productId: string, reasonOverride?: string) => {
    const check = buildCheck(productId, reasonOverride);
    if (!check) return;

    setCheckedProducts((prev) => new Set(prev).add(productId));
    try {
      const res = await fetch("/api/stockcheck/saveproduct", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(check),
      });
      if (!res.ok) throw new Error("Failed to save stock check");
    } catch (error) {
      console.error("Error saving stock check:", error);
      toast.error("Kunne ikke gemme optælling", {
        description: "Prøv igen eller tjek din forbindelse.",
      });
      setCheckedProducts((prev) => {
        const next = new Set(prev);
        next.delete(productId);
        return next;
      });
    }
  };

  const handleProductCheck = async (productId: string) => {
    const product = products.find((p) => p.id === productId);
    if (!product || !sessionId) return;

    // Toggle off — allow re-editing a line. Optimistically un-check, then
    // remove the saved count so progress reflects reality on resume.
    if (checkedProducts.has(productId)) {
      setCheckedProducts((prev) => {
        const next = new Set(prev);
        next.delete(productId);
        return next;
      });
      try {
        const res = await fetch("/api/stockcheck/saveproduct", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ productId, sessionId }),
        });
        if (!res.ok) throw new Error("Failed to delete stock check");
      } catch (error) {
        console.error("Error removing stock check:", error);
        toast.error("Kunne ikke fortryde optælling", {
          description: "Prøv igen eller tjek din forbindelse.",
        });
        setCheckedProducts((prev) => new Set(prev).add(productId));
      }
      return;
    }

    // A variance requires a reason — open the dialog instead of saving now.
    const variance = (productCounts[productId] || 0) - (product.expectedQty || 0);
    if (variance !== 0) {
      setReasonDialog({ open: true, productId });
      return;
    }

    await persistCheck(productId);
  };

  // Dialog confirmed: record the reason and persist the line.
  const handleReasonConfirm = (reason: string) => {
    const productId = reasonDialog.productId;
    if (!productId) return;
    setProductReasons((prev) => ({ ...prev, [productId]: reason }));
    setReasonDialog({ open: false, productId: null });
    void persistCheck(productId, reason);
  };
```

- [ ] **Step 7: Render dialogen**

Find det aktuelle dialog-produkt og render `VarianceReasonDialog` lige før den afsluttende `</div>` i return (lige efter "Sticky progress + complete"-blokken, omkring linje 586). Tilføj denne udledning sammen med de andre `useMemo`/derived values (fx efter `checkedAll`, omkring linje 287):

```tsx
  const reasonDialogProduct = useMemo(() => {
    if (!reasonDialog.productId) return null;
    const product = products.find((p) => p.id === reasonDialog.productId);
    if (!product) return null;
    return {
      id: product.id,
      name: product.name,
      sku: product.sku || product.id,
      expectedQty: product.expectedQty || 0,
      countedQty: productCounts[product.id] || 0,
    };
  }, [reasonDialog.productId, products, productCounts]);
```

Og lige før den sidste `</div>` i den returnerede JSX (efter den sticky bar's lukkende `</div>`):

```tsx
      <VarianceReasonDialog
        open={reasonDialog.open}
        onOpenChange={(open) =>
          setReasonDialog((prev) => ({ ...prev, open }))
        }
        product={reasonDialogProduct}
        initialReason={
          reasonDialog.productId
            ? productReasons[reasonDialog.productId] ?? null
            : null
        }
        onConfirm={handleReasonConfirm}
      />
```

- [ ] **Step 8: Verificér**

Run: `npm run lint && npm run build`
Expected: Build lykkes uden fejl.

- [ ] **Step 9: Commit**

```bash
git add components/stocktake/stockCheckClient.tsx
git commit -m "feat: require variance reason via dialog when confirming a line"
```

---

## Task 6: Persistér og returnér `reason` i API'et

**Files:**
- Modify: `app/api/stockcheck/saveproduct/route.ts`
- Modify: `app/api/stockcheck/stockdata/route.ts:52-65`

- [ ] **Step 1: Gem `reason` i batch-grenen af POST**

I `app/api/stockcheck/saveproduct/route.ts`, i `for`-løkkens update- og create-kald (linje 24-46), tilføj `reason`. Update-data bliver:

```ts
          stockCheck = await prisma.stockCheck.update({
            where: { id: existingCheck.id },
            data: {
              countedQty: checkData.countedQty,
              variance: checkData.variance,
              checkedBy: checkData.checkedBy,
              status: checkData.status,
              reason: checkData.reason ?? null,
              checkedAt: new Date()
            }
          });
```

Create-data bliver:

```ts
          stockCheck = await prisma.stockCheck.create({
            data: {
              productId: checkData.productId,
              sessionId: checkData.sessionId,
              expectedQty: checkData.expectedQty,
              countedQty: checkData.countedQty,
              variance: checkData.variance,
              checkedBy: checkData.checkedBy,
              status: checkData.status,
              reason: checkData.reason ?? null
            }
          });
```

- [ ] **Step 2: Gem `reason` i single-grenen af POST**

Opdater destruktureringen (linje 56) og de to kald (linje 66-89):

```ts
    const { productId, sessionId, expectedQty, countedQty, variance, checkedBy, status, reason } = body;
```

Update-data:

```ts
      stockCheck = await prisma.stockCheck.update({
        where: { id: existingCheck.id },
        data: {
          countedQty,
          variance,
          checkedBy,
          status,
          reason: reason ?? null,
          checkedAt: new Date()
        }
      });
```

Create-data:

```ts
      stockCheck = await prisma.stockCheck.create({
        data: {
          productId,
          sessionId,
          expectedQty,
          countedQty,
          variance,
          checkedBy,
          status,
          reason: reason ?? null
        }
      });
```

- [ ] **Step 3: Returnér `reason` fra stockdata-route'en**

I `app/api/stockcheck/stockdata/route.ts`, tilføj `reason: true` i `select`-blokken (linje 56-63):

```ts
    const checks = sessionId
      ? await prisma.stockCheck.findMany({
          where: { sessionId },
          select: {
            productId: true,
            countedQty: true,
            expectedQty: true,
            variance: true,
            checkedBy: true,
            status: true,
            reason: true,
          },
        })
      : [];
```

- [ ] **Step 4: Verificér**

Run: `npm run lint && npm run build`
Expected: Build lykkes uden fejl.

- [ ] **Step 5: Commit**

```bash
git add app/api/stockcheck/saveproduct/route.ts app/api/stockcheck/stockdata/route.ts
git commit -m "feat: persist and return variance reason in stockcheck API"
```

---

## Task 7: Vis årsag på review-siden

**Files:**
- Modify: `app/api/review/route.ts:74-89`
- Modify: `components/review/reviewClient.tsx`

- [ ] **Step 1: Inkludér `reason` i review-API'ets checkResults**

I `app/api/review/route.ts`, i `.map`-callbacken der bygger `checkResults` (linje 74-89), tilføj `reason` i returobjektet:

```ts
        return {
          id: check.id,
          article: check.product.sku,
          name: check.product.name,
          expectedQty,
          countedQty: check.countedQty,
          variance,
          value,
          reason: check.reason,
        };
```

(`check.reason` er tilgængelig fordi `stockChecks` allerede inkluderes uden eksplicit `select`.)

- [ ] **Step 2: Udvid `CheckResult`-interfacet og importér label-helper**

I `components/review/reviewClient.tsx`, tilføj `reason` til `CheckResult` (linje 40-48):

```tsx
interface CheckResult {
  id: string;
  article: string;
  name: string;
  expectedQty: number;
  countedQty: number;
  variance: number;
  value: number;
  reason: string | null;
}
```

Tilføj `getVarianceReasonLabel` til importen fra `@/lib/dashboard-display` (linje 29-36):

```tsx
import {
  getLocationName,
  getStatusMeta,
  formatDateDa,
  formatCurrency,
  valueVarianceTone,
  valueVarianceText,
  getVarianceReasonLabel,
} from "@/lib/dashboard-display";
```

- [ ] **Step 3: Vis årsag i desktop-tabellen**

Tilføj en "Årsag"-kolonne. I tabel-headeren (linje 246-259), indsæt en `TableHead` før "Værdi":

```tsx
                    <TableHead className="px-5 py-3">Årsag</TableHead>
                    <TableHead className="px-5 py-3 text-right">Værdi</TableHead>
```

I tabel-rækken (linje 262-292), indsæt en `TableCell` før værdi-cellen:

```tsx
                      <TableCell className="text-sm text-muted-foreground">
                        {getVarianceReasonLabel(item.reason) || "—"}
                      </TableCell>
                      <TableCell
                        className={cn(
                          "text-right font-medium tabular-nums",
                          valueVarianceText(item.value)
                        )}
                      >
                        {formatCurrency(item.value)}
                      </TableCell>
```

- [ ] **Step 4: Vis årsag i mobil-kortet**

I mobil-kortet (linje 299-334), tilføj en linje med årsag efter den `div` der viser forventet/optalt/værdi (efter linje 333's lukkende `</div>`, inden i kortets ydre `div`):

```tsx
                  {getVarianceReasonLabel(item.reason) && (
                    <p className="mt-2 text-sm text-muted-foreground">
                      Årsag:{" "}
                      <span className="text-foreground">
                        {getVarianceReasonLabel(item.reason)}
                      </span>
                    </p>
                  )}
```

- [ ] **Step 5: Verificér**

Run: `npm run lint && npm run build`
Expected: Build lykkes uden fejl.

- [ ] **Step 6: Commit**

```bash
git add app/api/review/route.ts components/review/reviewClient.tsx
git commit -m "feat: show variance reason on review page"
```

---

## Task 8: Vis årsag i arkiv-detaljer

**Files:**
- Modify: `types/archive.ts` (`ArchiveDetailItem`, omkring linje 28-37)
- Modify: `lib/archive-server.ts:108-122`
- Modify: `components/archive/archiveDetailClient.tsx`

- [ ] **Step 1: Tilføj `reason` til `ArchiveDetailItem`**

I `types/archive.ts`, udvid `ArchiveDetailItem`:

```ts
/** One counted product line on the archive detail page. */
export interface ArchiveDetailItem {
  id: string;
  article: string | null;
  name: string;
  expectedQty: number;
  countedQty: number;
  variance: number;
  /** variance * unit price (DKK). */
  value: number;
  /** Årsagskode for afvigelsen, eller null hvis ingen. */
  reason: string | null;
}
```

- [ ] **Step 2: Map `reason` i `getArchiveSessionDetail`**

I `lib/archive-server.ts`, i `items`-map'en (linje 108-122), tilføj `reason`:

```ts
      return {
        id: check.id,
        article: check.product.sku,
        name: check.product.name,
        expectedQty,
        countedQty: check.countedQty,
        variance,
        value,
        reason: check.reason,
      };
```

(`check.reason` er tilgængelig fordi `stockChecks` inkluderes med `include: { product: true }`, hvilket henter alle StockCheck-felter.)

- [ ] **Step 3: Importér label-helper i arkiv-detalje-komponenten**

I `components/archive/archiveDetailClient.tsx`, tilføj `getVarianceReasonLabel` til importen fra `@/lib/dashboard-display` (linje 27-33):

```tsx
import {
  formatCurrency,
  formatDateDa,
  getLocationNames,
  valueVarianceText,
  valueVarianceTone,
  getVarianceReasonLabel,
} from "@/lib/dashboard-display";
```

- [ ] **Step 4: Vis årsag i desktop-tabellen**

I tabel-headeren (linje 186-198), indsæt en `TableHead` før "Værdi":

```tsx
                    <TableHead className="px-5 py-3">Årsag</TableHead>
                    <TableHead className="px-5 py-3 text-right">Værdi</TableHead>
```

I tabel-rækken (linje 200-232), indsæt en `TableCell` før værdi-cellen:

```tsx
                      <TableCell className="text-sm text-muted-foreground">
                        {getVarianceReasonLabel(item.reason) || "—"}
                      </TableCell>
                      <TableCell
                        className={cn(
                          "text-right font-medium tabular-nums",
                          valueVarianceText(item.value)
                        )}
                      >
                        {formatCurrency(item.value)}
                      </TableCell>
```

- [ ] **Step 5: Vis årsag i mobil-kortet**

I mobil-kortet (linje 239-277), tilføj efter den `div` der viser forventet/optalt/værdi (efter linje 275's lukkende `</div>`, inden i kortets ydre `div`):

```tsx
                  {getVarianceReasonLabel(item.reason) && (
                    <p className="mt-2 text-sm text-muted-foreground">
                      Årsag:{" "}
                      <span className="text-foreground">
                        {getVarianceReasonLabel(item.reason)}
                      </span>
                    </p>
                  )}
```

- [ ] **Step 6: Inkludér årsag i CSV-eksporten**

I `handleExport` (linje 71-85), tilføj "Årsag" til header og felter:

```tsx
  const handleExport = () => {
    const csv = toCsv(
      ["Vare", "Varenr.", "Forventet", "Optalt", "Afvigelse", "Årsag", "Værdi (DKK)"],
      items.map((item) => [
        item.name,
        item.article ?? "",
        item.expectedQty,
        item.countedQty,
        item.variance,
        getVarianceReasonLabel(item.reason),
        csvNumber(item.value),
      ])
    );
    const namePart = slugifyForFilename(title) || "lagerstatus";
    downloadCsv(`lagerstatus-${namePart}-${session.date}.csv`, csv);
  };
```

- [ ] **Step 7: Verificér**

Run: `npm run lint && npm run build`
Expected: Build lykkes uden fejl.

- [ ] **Step 8: Commit**

```bash
git add types/archive.ts lib/archive-server.ts components/archive/archiveDetailClient.tsx
git commit -m "feat: show variance reason in archive detail and CSV export"
```

---

## Manuel end-to-end verifikation (efter alle tasks)

Run: `npm run dev` og gennemgå i browseren:

1. Start en optælling. Tæl en vare så den **stemmer** (afvigelse 0) → tryk Bekræft → linjen gemmes uden dialog.
2. Tæl en vare så der er **afvigelse** → tryk Bekræft → dialog åbner. Bekræft er deaktiveret indtil en årsag er valgt. Vælg årsag → Bekræft → linjen markeres talt.
3. Tryk **Fortryd** på samme linje, tæl igen med fortsat afvigelse → dialogen er forudfyldt med den tidligere årsag.
4. Forlad og genoptag optællingen → tidligere valgte årsager er bevaret.
5. Afslut optællingen → gå til **Gennemsyn**: årsag vises pr. afvigende vare (tabel + mobil).
6. Når lagerstatussen er afsluttet, åbn den i **Arkiv** → årsag vises pr. afvigende vare, og CSV-eksporten indeholder en Årsag-kolonne.
```
