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
