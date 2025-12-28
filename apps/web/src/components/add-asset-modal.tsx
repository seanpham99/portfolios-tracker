"use client";

import { useEffect, useState } from "react";
import { useForm, useWatch, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  CheckCircle2,
  Clock,
  Globe,
  Loader2,
  Plus,
  Search,
  TrendingUp,
  Coins,
  Building2,
  ChevronLeft,
} from "lucide-react";

import {
  portfolioStore,
  useAssetRequests,
  type AssetRequest,
} from "@/stores/portfolio-store";
import type { Asset } from "./asset-blade";

import { Button } from "@repo/ui/components/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@repo/ui/components/dialog";
import {
  Field,
  FieldLabel,
  FieldError
} from "@repo/ui/components/field";
import { Input } from "@repo/ui/components/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@repo/ui/components/select";
import { ScrollArea } from "@repo/ui/components/scroll-area";
import { Badge } from "@repo/ui/components/badge";

// --- Types & Data ---

interface AddAssetModalProps {
  isOpen: boolean;
  onClose: () => void;
  stageId: string;
}

const popularAssets = [
  { symbol: "AAPL", name: "Apple Inc.", type: "equities" },
  { symbol: "MSFT", name: "Microsoft Corp.", type: "equities" },
  { symbol: "GOOGL", name: "Alphabet Inc.", type: "equities" },
  { symbol: "AMZN", name: "Amazon.com Inc.", type: "equities" },
  { symbol: "META", name: "Meta Platforms", type: "equities" },
  { symbol: "BTC", name: "Bitcoin", type: "crypto", icon: "₿" },
  { symbol: "ETH", name: "Ethereum", type: "crypto", icon: "Ξ" },
  { symbol: "SOL", name: "Solana", type: "crypto" },
  { symbol: "VNQ", name: "Vanguard Real Estate", type: "real-estate" },
  { symbol: "O", name: "Realty Income Corp", type: "real-estate" },
];

const exchanges = [
  { value: "NYSE", label: "NYSE (US)" },
  { value: "NASDAQ", label: "NASDAQ (US)" },
  { value: "NSE", label: "NSE (India)" },
  { value: "BSE", label: "BSE (India)" },
  { value: "LSE", label: "LSE (UK)" },
  { value: "TSE", label: "TSE (Japan)" },
  { value: "HKEX", label: "HKEX (Hong Kong)" },
  { value: "SSE", label: "SSE (China)" },
  { value: "other", label: "Other" },
];

const assetTypes = [
  { value: "stock", label: "Stock" },
  { value: "crypto", label: "Cryptocurrency" },
  { value: "etf", label: "ETF" },
  { value: "real_estate", label: "Real Estate" },
  { value: "other", label: "Other" },
];

function generateSparkline(): number[] {
  const data: number[] = [];
  let value = 100;
  for (let i = 0; i < 20; i++) {
    value = value + (Math.random() - 0.48) * 6;
    data.push(Math.max(50, Math.min(150, value)));
  }
  return data;
}

// --- Schemas ---

const addAssetSchema = z.object({
  quantity: z.string().refine((val) => !isNaN(Number(val)) && Number(val) > 0, "Ctq > 0"),
  pricePerUnit: z.string().refine((val) => !isNaN(Number(val)) && Number(val) > 0, "Price > 0"),
});

const requestAssetSchema = z.object({
  symbol: z.string().min(1, "Symbol is required"),
  name: z.string().optional(),
  type: z.enum(["stock", "crypto", "etf", "real_estate", "other"]),
  exchange: z.string().optional(),
  country: z.string().optional(),
});

type AddAssetFormValues = z.infer<typeof addAssetSchema>;
type RequestAssetFormValues = z.infer<typeof requestAssetSchema>;

// --- Sub-Components ---

function PendingRequestsBadge({
  count,
  onClick,
}: {
  count: number;
  onClick: () => void;
}) {
  if (count === 0) return null;
  return (
    <Badge
      variant="outline"
      onClick={onClick}
      className="cursor-pointer gap-2 border-amber-500/20 bg-amber-500/10 text-amber-400 hover:bg-amber-500/20 hover:text-amber-300"
    >
      <Clock className="h-3 w-3" />
      {count} pending
    </Badge>
  );
}

function RequestStatusBadge({
  status,
  progress,
}: {
  status: AssetRequest["status"];
  progress: number;
}) {
  const config = {
    pending: { variant: "outline" as const, className: "border-amber-500/20 bg-amber-500/10 text-amber-400", label: "Pending" },
    processing: { variant: "outline" as const, className: "border-indigo-500/20 bg-indigo-500/10 text-indigo-400", label: `Processing ${Math.round(progress)}%` },
    approved: { variant: "outline" as const, className: "border-emerald-500/20 bg-emerald-500/10 text-emerald-400", label: "Available" },
    rejected: { variant: "outline" as const, className: "border-rose-500/20 bg-rose-500/10 text-rose-400", label: "Unavailable" },
  };
  const c = config[status];
  return (
    <Badge variant={c.variant} className={c.className}>
      {status === "processing" && <Loader2 className="mr-1 h-3 w-3 animate-spin" />}
      {status === "approved" && <CheckCircle2 className="mr-1 h-3 w-3" />}
      {c.label}
    </Badge>
  );
}

// --- Main Component ---

export function AddAssetModal({
  isOpen,
  onClose,
  stageId,
}: AddAssetModalProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedAsset, setSelectedAsset] = useState<(typeof popularAssets)[0] | null>(null);
  const [showRequestForm, setShowRequestForm] = useState(false);
  const [showPendingRequests, setShowPendingRequests] = useState(false);
  const [requestSubmitted, setRequestSubmitted] = useState(false);

  const { requests, pendingCount, submitRequest } = useAssetRequests();
  const userPendingRequests = requests.filter(
    (r) => r.status === "pending" || r.status === "processing",
  );

  // Forms
  const addForm = useForm<AddAssetFormValues>({
    resolver: zodResolver(addAssetSchema),
    defaultValues: { quantity: "", pricePerUnit: "" },
  });

  const requestForm = useForm<RequestAssetFormValues>({
    resolver: zodResolver(requestAssetSchema),
    defaultValues: {
      symbol: "",
      name: "",
      type: "stock",
      exchange: "",
      country: "",
    },
  });

  // Watch for totals calculation
  const qty = useWatch({ control: addForm.control, name: "quantity" });
  const price = useWatch({ control: addForm.control, name: "pricePerUnit" });
  const totalValue = Number(qty || 0) * Number(price || 0);

  // Filter assets
  const filteredAssets = popularAssets.filter(
    (asset) =>
      (asset.type === stageId || stageId === "all") &&
      (asset.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
        asset.name.toLowerCase().includes(searchQuery.toLowerCase())),
  );

  const pendingRequest = requests.find(
    (r) =>
      r.symbol.toLowerCase() === searchQuery.toLowerCase() &&
      (r.status === "pending" || r.status === "processing"),
  );

  // Reset state when opening/closing
  useEffect(() => {
    if (isOpen) {
      setSearchQuery("");
      setSelectedAsset(null);
      setShowRequestForm(false);
      setShowPendingRequests(false);
      addForm.reset();
      requestForm.reset();
    }
  }, [isOpen, addForm, requestForm]);

  // Handlers
  const handleAddAsset = (values: AddAssetFormValues) => {
    if (!selectedAsset) return;

    const quantityVal = Number(values.quantity);
    const priceVal = Number(values.pricePerUnit);
    const total = quantityVal * priceVal;

    const newAsset: Asset = {
      id: selectedAsset.symbol.toLowerCase() + "-" + Date.now(),
      symbol: selectedAsset.symbol,
      name: selectedAsset.name,
      value: total,
      change: (Math.random() - 0.5) * 4,
      allocation: 0,
      sparklineData: generateSparkline(),
      icon: (selectedAsset as { icon?: string }).icon,
    };

    portfolioStore.addAsset(stageId, newAsset);
    portfolioStore.addTransaction({
      assetId: newAsset.id,
      symbol: newAsset.symbol,
      type: "buy",
      quantity: quantityVal,
      price: priceVal,
      total: total,
    });
    portfolioStore.addNotification({
      type: "portfolio_change",
      title: "Asset Added",
      message: `Added ${values.quantity} ${selectedAsset.symbol} worth $${total.toLocaleString()}`,
    });

    onClose();
  };

  const handleRequestAsset = (values: RequestAssetFormValues) => {
    submitRequest({
      symbol: values.symbol.toUpperCase(),
      name: values.name || values.symbol.toUpperCase(),
      type: values.type,
      exchange: values.exchange || undefined,
      country: values.country || undefined,
    });

    setRequestSubmitted(true);
    setTimeout(() => {
      setShowRequestForm(false);
      requestForm.reset();
      setRequestSubmitted(false);
    }, 2000);
  };

  const handleOpenChange = (open: boolean) => {
    if (!open) onClose();
  };

  const canGoBack = !!(selectedAsset || showRequestForm || showPendingRequests);
  const handleBack = () => {
    setSelectedAsset(null);
    setShowRequestForm(false);
    setShowPendingRequests(false);
  };

  const getStageIcon = () => {
    switch (stageId) {
      case "equities": return <TrendingUp className="h-5 w-5" />;
      case "crypto": return <Coins className="h-5 w-5" />;
      case "real-estate": return <Building2 className="h-5 w-5" />;
      default: return <Plus className="h-5 w-5" />;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-lg bg-zinc-900 border-white/[0.08] text-white p-0 gap-0 overflow-hidden flex flex-col h-[600px]">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/[0.08] px-6 py-4 shrink-0">
          <div className="flex items-center gap-3">
            {canGoBack ? (
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={handleBack} 
                className="h-10 w-10 rounded-xl bg-white/[0.05] text-zinc-400 hover:bg-white/[0.1] hover:text-white"
              >
                <ChevronLeft className="h-5 w-5" />
              </Button>
            ) : (
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-400">
                {getStageIcon()}
              </div>
            )}
            <div>
              <DialogTitle className="font-serif text-xl font-light">
                {selectedAsset ? selectedAsset.symbol : "Add Asset"}
              </DialogTitle>
              <DialogDescription className="text-xs text-zinc-500 capitalize">
                {selectedAsset ? selectedAsset.name : stageId.replace("-", " ")}
              </DialogDescription>
            </div>
          </div>
          {!canGoBack && (
            <PendingRequestsBadge
                count={pendingCount}
                onClick={() => {
                    setShowPendingRequests(!showPendingRequests);
                    setSelectedAsset(null);
                    setShowRequestForm(false);
                }}
            />
          )}
        </div>

        <div className="p-6 flex-1 flex flex-col min-h-0">
          {showPendingRequests ? (
            <div className="flex flex-col h-full space-y-4">
               <h3 className="text-sm font-medium text-zinc-300 shrink-0">Your Pending Requests</h3>
                <ScrollArea className="flex-1 w-full rounded-md border border-white/5 pr-4 max-h-full min-h-0 flex flex-col [&>[data-slot=scroll-area-viewport]]:flex-1">
                    {userPendingRequests.length === 0 ? (
                        <div className="py-8 text-center text-sm text-zinc-500">No pending requests</div>
                    ) : (
                        userPendingRequests.map((request) => (
                           <div key={request.id} className="mb-2 rounded-xl border border-white/[0.05] bg-white/[0.02] p-4">
                                <div className="flex items-start justify-between">
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <span className="font-medium text-white">{request.symbol}</span>
                                            <RequestStatusBadge status={request.status} progress={request.progress} />
                                        </div>
                                        <p className="mt-0.5 text-sm text-zinc-500">{request.name}</p>
                                    </div>
                                    {request.status === "pending" && (
                                        <Button variant="ghost" size="sm" onClick={() => portfolioStore.cancelAssetRequest(request.id)} className="h-6 text-xs text-zinc-500 hover:text-rose-400">
                                            Cancel
                                        </Button>
                                    )}
                                </div>
                           </div> 
                        ))
                    )}
                </ScrollArea>
            </div>
          ) : !selectedAsset ? (
            <>
              {/* Search State */}
              <div className="relative mb-4 shrink-0">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
                <Input
                  placeholder="Search by symbol or name..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-white/[0.03] border-white/[0.08] focus-visible:ring-indigo-500/50"
                  autoFocus={!showRequestForm}
                />
              </div>

              {!showRequestForm ? (
                <ScrollArea className="flex-1 w-full rounded-md border border-white/5 max-h-full min-h-0 flex flex-col [&>[data-slot=scroll-area-viewport]]:flex-1">
                  {filteredAssets.length > 0 ? (
                    <div className="space-y-2 p-2 pt-0">
                      {filteredAssets.map((asset) => (
                        <button
                          key={asset.symbol}
                          onClick={() => setSelectedAsset(asset)}
                          className="flex w-full items-center gap-3 rounded-xl bg-white/[0.03] p-3 transition-colors hover:bg-white/[0.06]"
                        >
                          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/[0.05] text-sm font-medium text-zinc-300">
                            {(asset as { icon?: string }).icon || asset.symbol.slice(0, 2)}
                          </div>
                          <div className="flex-1 text-left">
                            <p className="font-medium text-white">{asset.symbol}</p>
                            <p className="text-xs text-zinc-500">{asset.name}</p>
                          </div>
                          <Plus className="h-4 w-4 text-zinc-500" />
                        </button>
                      ))}
                    </div>
                  ) : (
                    <div className="py-6 text-center">
                        <p className="mb-4 text-sm text-zinc-500">No assets found for "{searchQuery}"</p>
                        <Button
                            variant="outline"
                            onClick={() => {
                                setShowRequestForm(true);
                                requestForm.setValue("symbol", searchQuery);
                            }}
                            className="bg-indigo-500/10 text-indigo-400 border-indigo-500/20 hover:bg-indigo-500/20"
                        >
                             <Clock className="mr-2 h-4 w-4" /> Request Tracking
                        </Button>
                    </div>
                  )}
                </ScrollArea>
              ) : (
                /* Request Form */
                <ScrollArea className="flex-1 w-full -mr-6 pr-6 max-h-full min-h-0 flex flex-col [&>[data-slot=scroll-area-viewport]]:flex-1">
                <form onSubmit={requestForm.handleSubmit(handleRequestAsset)} className="space-y-4 px-1">
                    <div className="flex items-center gap-2 mb-2">
                        <Globe className="h-4 w-4 text-indigo-400" />
                        <span className="text-sm font-medium text-zinc-300">Request Asset Tracking</span>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <Controller
                            control={requestForm.control}
                            name="symbol"
                            render={({ field, fieldState }) => (
                                <Field data-invalid={fieldState.invalid}>
                                    <FieldLabel htmlFor={field.name} className="text-xs text-zinc-500 font-normal">Symbol</FieldLabel>
                                    <Input
                                        id={field.name}
                                        {...field}
                                        className="bg-white/[0.03] border-white/[0.08]"
                                        placeholder="e.g. RELIANCE"
                                        aria-invalid={fieldState.invalid}
                                    />
                                    {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                                </Field>
                            )}
                        />
                         <Controller
                            control={requestForm.control}
                            name="name"
                            render={({ field, fieldState }) => (
                                <Field data-invalid={fieldState.invalid}>
                                    <FieldLabel htmlFor={field.name} className="text-xs text-zinc-500 font-normal">Name</FieldLabel>
                                    <Input
                                        id={field.name}
                                        {...field}
                                        className="bg-white/[0.03] border-white/[0.08]"
                                        placeholder="Company Name"
                                        aria-invalid={fieldState.invalid}
                                    />
                                    {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                                </Field>
                            )}
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <Controller
                            control={requestForm.control}
                            name="type"
                            render={({ field, fieldState }) => (
                                <Field data-invalid={fieldState.invalid}>
                                    <FieldLabel htmlFor={field.name} className="text-xs text-zinc-500 font-normal">Type</FieldLabel>
                                    <Select
                                        name={field.name}
                                        value={field.value}
                                        onValueChange={field.onChange}
                                    >
                                        <SelectTrigger
                                            id={field.name}
                                            aria-invalid={fieldState.invalid}
                                            className="bg-white/[0.03] border-white/[0.08]"
                                        >
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent className="bg-zinc-900 border-white/[0.08] text-white">
                                            {assetTypes.map(t => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}
                                        </SelectContent>
                                    </Select>
                                    {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                                </Field>
                            )}
                        />
                         <Controller
                            control={requestForm.control}
                            name="exchange"
                            render={({ field, fieldState }) => (
                                <Field data-invalid={fieldState.invalid}>
                                    <FieldLabel htmlFor={field.name} className="text-xs text-zinc-500 font-normal">Exchange</FieldLabel>
                                     <Select
                                        name={field.name}
                                        value={field.value}
                                        onValueChange={field.onChange}
                                    >
                                        <SelectTrigger
                                            id={field.name}
                                            aria-invalid={fieldState.invalid}
                                            className="bg-white/[0.03] border-white/[0.08]"
                                        >
                                            <SelectValue placeholder="Optional" />
                                        </SelectTrigger>
                                        <SelectContent className="bg-zinc-900 border-white/[0.08] text-white">
                                            {exchanges.map(e => <SelectItem key={e.value} value={e.value}>{e.label}</SelectItem>)}
                                        </SelectContent>
                                    </Select>
                                    {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                                </Field>
                            )}
                        />
                    </div>
                    <div className="flex gap-2 pt-2">
                        <Button type="button" variant="outline" className="flex-1 border-white/[0.08] bg-transparent text-zinc-400 hover:bg-white/[0.05]" onClick={() => setShowRequestForm(false)}>Cancel</Button>
                        <Button type="submit" disabled={requestSubmitted} className="flex-1 bg-indigo-500 text-white hover:bg-indigo-400">
                            {requestSubmitted ? "Submitted!" : "Submit Request"}
                        </Button>
                    </div>
                </form>
                </ScrollArea>
              )}
            </>
          ) : (
            /* Add Asset Form (Input Quantity/Price) */
             <div className="space-y-6">
                  {/* Removed the asset info card that had the Change button as it's now in header */}
                  
                  <form onSubmit={addForm.handleSubmit(handleAddAsset)} className="space-y-4">
                         <Controller
                            control={addForm.control}
                            name="quantity"
                            render={({ field, fieldState }) => (
                                <Field data-invalid={fieldState.invalid}>
                                    <FieldLabel htmlFor={field.name} className="text-zinc-400 font-normal">Quantity</FieldLabel>
                                    <Input
                                        id={field.name}
                                        type="number"
                                        {...field}
                                        className="bg-white/[0.03] border-white/[0.08] focus-visible:ring-indigo-500/50"
                                        placeholder="0.00"
                                        aria-invalid={fieldState.invalid}
                                    />
                                    {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                                </Field>
                            )}
                        />
                         <Controller
                            control={addForm.control}
                            name="pricePerUnit"
                            render={({ field, fieldState }) => (
                                <Field data-invalid={fieldState.invalid}>
                                    <FieldLabel htmlFor={field.name} className="text-zinc-400 font-normal">Price per unit ($)</FieldLabel>
                                    <Input
                                        id={field.name}
                                        type="number"
                                        {...field}
                                        className="bg-white/[0.03] border-white/[0.08] focus-visible:ring-indigo-500/50"
                                        placeholder="0.00"
                                        aria-invalid={fieldState.invalid}
                                    />
                                    {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                                </Field>
                            )}
                        />
                         
                          {totalValue > 0 && (
                           <div className="rounded-xl bg-white/[0.03] p-4 flex justify-between items-center">
                             <span className="text-sm text-zinc-400">Total Value</span>
                             <span className="text-xl font-semibold text-white">
                               ${totalValue.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                             </span>
                           </div>
                         )}
 
                         <Button type="submit" disabled={!addForm.formState.isValid} className="w-full bg-emerald-600 hover:bg-emerald-500 text-white py-6 text-lg">
                             Add to Portfolio
                         </Button>
                     </form>
              </div>
           )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
