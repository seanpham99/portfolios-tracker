"use client";

import { useEffect } from "react";
import { useForm, useWatch, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { ArrowDownRight, ArrowUpRight } from "lucide-react";

import { cn } from "@repo/ui/lib/utils";
import { portfolioStore } from "@/stores/portfolio-store";
import type { Asset } from "./asset-blade";
import { Button } from "@repo/ui/components/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@repo/ui/components/dialog";
import { Field, FieldLabel, FieldError } from "@repo/ui/components/field";
import { Input } from "@repo/ui/components/input";

const formSchema = z.object({
  quantity: z
    .string()
    .refine(
      (val) => !isNaN(Number(val)) && Number(val) > 0,
      "Quantity must be a positive number",
    ),
  price: z
    .string()
    .refine(
      (val) => !isNaN(Number(val)) && Number(val) > 0,
      "Price must be a positive number",
    ),
});

type FormValues = z.infer<typeof formSchema>;

interface TransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  asset: Asset;
  type: "buy" | "sell";
}

export function TransactionModal({
  isOpen,
  onClose,
  asset,
  type,
}: TransactionModalProps) {
  const isBuy = type === "buy";

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      quantity: "",
      price: (asset.value / 100).toFixed(2), // Logic from original file, though strict logic might vary
    },
  });

  const quantity = useWatch({ control: form.control, name: "quantity" });
  const price = useWatch({ control: form.control, name: "price" });

  const total =
    Number.parseFloat(quantity || "0") * Number.parseFloat(price || "0");

  useEffect(() => {
    if (isOpen) {
      form.reset({
        quantity: "",
        price: (asset.value / 100).toFixed(2),
      });
    }
  }, [isOpen, form, asset.value]);

  const onSubmit = (values: FormValues) => {
    const qty = Number.parseFloat(values.quantity);
    const p = Number.parseFloat(values.price);
    const t = qty * p;

    portfolioStore.addTransaction({
      assetId: asset.id,
      symbol: asset.symbol,
      type,
      quantity: qty,
      price: p,
      total: t,
    });

    portfolioStore.addNotification({
      type: "portfolio_change",
      title: `${isBuy ? "Bought" : "Sold"} ${asset.symbol}`,
      message: `${isBuy ? "Purchased" : "Sold"} ${values.quantity} ${asset.symbol} at $${p.toLocaleString()} per unit`,
      assetId: asset.id,
    });

    onClose();
  };

  const handleOpenChange = (open: boolean) => {
    if (!open) onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md bg-zinc-900 border-white/[0.08] text-white p-0 overflow-hidden gap-0">
        <DialogHeader
          className={cn(
            "px-6 py-4 border-b border-white/[0.08]",
            isBuy ? "bg-emerald-500/5" : "bg-rose-500/5",
          )}
        >
          <div className="flex items-center gap-3">
            <div
              className={cn(
                "flex h-10 w-10 items-center justify-center rounded-xl",
                isBuy
                  ? "bg-emerald-500/10 text-emerald-400"
                  : "bg-rose-500/10 text-rose-400",
              )}
            >
              {isBuy ? (
                <ArrowUpRight className="h-5 w-5" />
              ) : (
                <ArrowDownRight className="h-5 w-5" />
              )}
            </div>
            <div>
              <DialogTitle className="font-serif text-xl font-light">
                {isBuy ? "Buy" : "Sell"} {asset.symbol}
              </DialogTitle>
              <DialogDescription className="text-zinc-500">
                {asset.name}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="p-6 space-y-4">
          {/* Current Value Display */}
          <div className="rounded-xl bg-white/[0.03] p-4">
            <div className="flex items-center justify-between text-sm">
              <span className="text-zinc-500">Current Value</span>
              <span className="font-medium text-white">
                $
                {asset.value.toLocaleString("en-US", {
                  minimumFractionDigits: 2,
                })}
              </span>
            </div>
          </div>

          <Controller
            control={form.control}
            name="quantity"
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel
                  htmlFor={field.name}
                  className="text-zinc-400 font-normal"
                >
                  Quantity
                </FieldLabel>
                <Input
                  id={field.name}
                  type="number"
                  placeholder="0.00"
                  {...field}
                  className="bg-white/[0.03] border-white/[0.08] focus-visible:ring-emerald-500/50"
                  aria-invalid={fieldState.invalid}
                />
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />

          <Controller
            control={form.control}
            name="price"
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel
                  htmlFor={field.name}
                  className="text-zinc-400 font-normal"
                >
                  Price per unit ($)
                </FieldLabel>
                <Input
                  id={field.name}
                  type="number"
                  placeholder="0.00"
                  {...field}
                  className="bg-white/[0.03] border-white/[0.08] focus-visible:ring-emerald-500/50"
                  aria-invalid={fieldState.invalid}
                />
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />

          {total > 0 && (
            <div
              className={cn(
                "rounded-xl p-4 flex items-center justify-between",
                isBuy ? "bg-emerald-500/10" : "bg-rose-500/10",
              )}
            >
              <span className="text-sm text-zinc-400">
                Total {isBuy ? "Cost" : "Proceeds"}
              </span>
              <span
                className={cn(
                  "text-xl font-semibold",
                  isBuy ? "text-emerald-400" : "text-rose-400",
                )}
              >
                ${total.toLocaleString("en-US", { minimumFractionDigits: 2 })}
              </span>
            </div>
          )}

          <DialogFooter className="pt-2">
            <Button
              type="button"
              variant="ghost"
              onClick={onClose}
              className="text-zinc-400 hover:text-white hover:bg-white/[0.05]"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={!form.formState.isValid}
              className={cn(
                "w-full sm:w-auto min-w-[120px]",
                isBuy
                  ? "bg-emerald-600 hover:bg-emerald-500"
                  : "bg-rose-600 hover:bg-rose-500",
              )}
            >
              Confirm {isBuy ? "Purchase" : "Sale"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
