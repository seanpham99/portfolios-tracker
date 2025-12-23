"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  X,
  Search,
  Plus,
  Clock,
  Building2,
  Coins,
  TrendingUp,
  Globe,
  ChevronDown,
  Loader2,
  CheckCircle2,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { portfolioStore, useAssetRequests, type AssetRequest } from "@/stores/portfolio-store"
import type { Asset } from "./asset-blade"

interface AddAssetModalProps {
  isOpen: boolean
  onClose: () => void
  stageId: string
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
]

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
]

const assetTypes: { value: AssetRequest["type"]; label: string }[] = [
  { value: "stock", label: "Stock" },
  { value: "crypto", label: "Cryptocurrency" },
  { value: "etf", label: "ETF" },
  { value: "real_estate", label: "Real Estate" },
  { value: "other", label: "Other" },
]

function generateSparkline(): number[] {
  const data: number[] = []
  let value = 100
  for (let i = 0; i < 20; i++) {
    value = value + (Math.random() - 0.48) * 6
    data.push(Math.max(50, Math.min(150, value)))
  }
  return data
}

function PendingRequestsBadge({ count, onClick }: { count: number; onClick: () => void }) {
  if (count === 0) return null
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-2 rounded-lg bg-amber-500/10 px-3 py-1.5 text-xs font-medium text-amber-400 transition-colors hover:bg-amber-500/20"
    >
      <Clock className="h-3 w-3" />
      {count} pending request{count !== 1 ? "s" : ""}
    </button>
  )
}

function RequestStatusBadge({ status, progress }: { status: AssetRequest["status"]; progress: number }) {
  const config = {
    pending: { bg: "bg-amber-500/10", text: "text-amber-400", label: "Pending" },
    processing: { bg: "bg-indigo-500/10", text: "text-indigo-400", label: `Processing ${Math.round(progress)}%` },
    approved: { bg: "bg-emerald-500/10", text: "text-emerald-400", label: "Available" },
    rejected: { bg: "bg-rose-500/10", text: "text-rose-400", label: "Unavailable" },
  }
  const c = config[status]
  return (
    <span className={cn("inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-xs font-medium", c.bg, c.text)}>
      {status === "processing" && <Loader2 className="h-3 w-3 animate-spin" />}
      {status === "approved" && <CheckCircle2 className="h-3 w-3" />}
      {c.label}
    </span>
  )
}

export function AddAssetModal({ isOpen, onClose, stageId }: AddAssetModalProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedAsset, setSelectedAsset] = useState<(typeof popularAssets)[0] | null>(null)
  const [quantity, setQuantity] = useState("")
  const [pricePerUnit, setPricePerUnit] = useState("")
  const [showRequestForm, setShowRequestForm] = useState(false)
  const [showPendingRequests, setShowPendingRequests] = useState(false)

  const [requestData, setRequestData] = useState({
    symbol: "",
    name: "",
    type: "stock" as AssetRequest["type"],
    exchange: "",
    country: "",
  })
  const [requestSubmitted, setRequestSubmitted] = useState(false)

  const { requests, pendingCount, submitRequest } = useAssetRequests()
  const userPendingRequests = requests.filter((r) => r.status === "pending" || r.status === "processing")

  const filteredAssets = popularAssets.filter(
    (asset) =>
      (asset.type === stageId || stageId === "all") &&
      (asset.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
        asset.name.toLowerCase().includes(searchQuery.toLowerCase())),
  )

  const pendingRequest = requests.find(
    (r) =>
      r.symbol.toLowerCase() === searchQuery.toLowerCase() && (r.status === "pending" || r.status === "processing"),
  )

  const handleAddAsset = () => {
    if (!selectedAsset || !quantity || !pricePerUnit) return

    const totalValue = Number.parseFloat(quantity) * Number.parseFloat(pricePerUnit)
    const newAsset: Asset = {
      id: selectedAsset.symbol.toLowerCase() + "-" + Date.now(),
      symbol: selectedAsset.symbol,
      name: selectedAsset.name,
      value: totalValue,
      change: (Math.random() - 0.5) * 4,
      allocation: 0,
      sparklineData: generateSparkline(),
      icon: (selectedAsset as { icon?: string }).icon,
    }

    portfolioStore.addAsset(stageId, newAsset)
    portfolioStore.addTransaction({
      assetId: newAsset.id,
      symbol: newAsset.symbol,
      type: "buy",
      quantity: Number.parseFloat(quantity),
      price: Number.parseFloat(pricePerUnit),
      total: totalValue,
    })
    portfolioStore.addNotification({
      type: "portfolio_change",
      title: "Asset Added",
      message: `Added ${quantity} ${selectedAsset.symbol} worth $${totalValue.toLocaleString()}`,
    })

    onClose()
    setSelectedAsset(null)
    setQuantity("")
    setPricePerUnit("")
  }

  const handleRequestAsset = () => {
    if (!requestData.symbol) return

    submitRequest({
      symbol: requestData.symbol.toUpperCase(),
      name: requestData.name || requestData.symbol.toUpperCase(),
      type: requestData.type,
      exchange: requestData.exchange || undefined,
      country: requestData.country || undefined,
    })

    setRequestSubmitted(true)
    setTimeout(() => {
      setShowRequestForm(false)
      setRequestData({ symbol: "", name: "", type: "stock", exchange: "", country: "" })
      setRequestSubmitted(false)
    }, 2000)
  }

  const getStageIcon = () => {
    switch (stageId) {
      case "equities":
        return <TrendingUp className="h-5 w-5" />
      case "crypto":
        return <Coins className="h-5 w-5" />
      case "real-estate":
        return <Building2 className="h-5 w-5" />
      default:
        return <Plus className="h-5 w-5" />
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-lg rounded-2xl border border-white/[0.08] bg-zinc-900/95 shadow-2xl backdrop-blur-xl"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-white/[0.08] px-6 py-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-400">
                  {getStageIcon()}
                </div>
                <div>
                  <h2 className="font-serif text-xl font-light text-white">Add Asset</h2>
                  <p className="text-xs text-zinc-500 capitalize">{stageId.replace("-", " ")}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <PendingRequestsBadge
                  count={pendingCount}
                  onClick={() => setShowPendingRequests(!showPendingRequests)}
                />
                <button
                  onClick={onClose}
                  className="flex h-8 w-8 items-center justify-center rounded-full bg-white/5 transition-colors hover:bg-white/10"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            <div className="p-6">
              {showPendingRequests ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-medium text-zinc-300">Your Pending Requests</h3>
                    <button
                      onClick={() => setShowPendingRequests(false)}
                      className="text-xs text-indigo-400 hover:text-indigo-300"
                    >
                      Back to search
                    </button>
                  </div>

                  {userPendingRequests.length === 0 ? (
                    <div className="py-8 text-center text-sm text-zinc-500">No pending requests</div>
                  ) : (
                    <div className="max-h-72 space-y-2 overflow-y-auto">
                      {userPendingRequests.map((request) => (
                        <div key={request.id} className="rounded-xl border border-white/[0.05] bg-white/[0.02] p-4">
                          <div className="flex items-start justify-between">
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-medium text-white">{request.symbol}</span>
                                <RequestStatusBadge status={request.status} progress={request.progress} />
                              </div>
                              <p className="mt-0.5 text-sm text-zinc-500">{request.name}</p>
                              {request.exchange && (
                                <p className="mt-1 text-xs text-zinc-600">
                                  {request.exchange} {request.country && `• ${request.country}`}
                                </p>
                              )}
                            </div>
                            {request.status === "pending" && (
                              <button
                                onClick={() => portfolioStore.cancelAssetRequest(request.id)}
                                className="text-xs text-zinc-500 hover:text-rose-400"
                              >
                                Cancel
                              </button>
                            )}
                          </div>

                          {/* Progress bar for processing requests */}
                          {request.status === "processing" && (
                            <div className="mt-3">
                              <div className="h-1 overflow-hidden rounded-full bg-white/[0.05]">
                                <motion.div
                                  className="h-full bg-indigo-500"
                                  initial={{ width: 0 }}
                                  animate={{ width: `${request.progress}%` }}
                                  transition={{ duration: 0.5 }}
                                />
                              </div>
                              {request.estimatedCompletion && (
                                <p className="mt-1.5 text-xs text-zinc-600">
                                  Est. completion: {request.estimatedCompletion.toLocaleTimeString()}
                                </p>
                              )}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ) : !selectedAsset ? (
                <>
                  {/* Search */}
                  <div className="relative mb-4">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
                    <input
                      type="text"
                      placeholder="Search by symbol or name..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full rounded-xl border border-white/[0.08] bg-white/[0.03] py-3 pl-10 pr-4 text-white placeholder-zinc-500 outline-none transition-colors focus:border-indigo-500/50"
                    />
                  </div>

                  {/* Asset List */}
                  <div className="max-h-64 space-y-2 overflow-y-auto">
                    {filteredAssets.length > 0 ? (
                      filteredAssets.map((asset) => (
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
                      ))
                    ) : (
                      <div className="py-6 text-center">
                        {pendingRequest ? (
                          <div className="space-y-3">
                            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-amber-500/10">
                              <Clock className="h-6 w-6 text-amber-400" />
                            </div>
                            <div>
                              <p className="font-medium text-white">{pendingRequest.symbol}</p>
                              <RequestStatusBadge status={pendingRequest.status} progress={pendingRequest.progress} />
                            </div>
                            <p className="text-sm text-zinc-500">You've already requested tracking for this asset.</p>
                          </div>
                        ) : !showRequestForm ? (
                          <>
                            <p className="mb-4 text-sm text-zinc-500">No assets found for "{searchQuery}"</p>
                            <button
                              onClick={() => {
                                setShowRequestForm(true)
                                setRequestData((prev) => ({ ...prev, symbol: searchQuery }))
                              }}
                              className="inline-flex items-center gap-2 rounded-lg bg-indigo-500/10 px-4 py-2 text-sm font-medium text-indigo-400 transition-colors hover:bg-indigo-500/20"
                            >
                              <Clock className="h-4 w-4" />
                              Request Tracking
                            </button>
                          </>
                        ) : (
                          /* Enhanced request form with more fields */
                          <div className="space-y-4 text-left">
                            <div className="flex items-center gap-2">
                              <Globe className="h-4 w-4 text-indigo-400" />
                              <span className="text-sm font-medium text-zinc-300">Request Asset Tracking</span>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                              <div>
                                <label className="mb-1 block text-xs text-zinc-500">Symbol *</label>
                                <input
                                  type="text"
                                  placeholder="e.g., RELIANCE"
                                  value={requestData.symbol}
                                  onChange={(e) =>
                                    setRequestData((prev) => ({ ...prev, symbol: e.target.value.toUpperCase() }))
                                  }
                                  className="w-full rounded-lg border border-white/[0.08] bg-white/[0.03] px-3 py-2 text-sm text-white placeholder-zinc-600 outline-none focus:border-indigo-500/50"
                                />
                              </div>
                              <div>
                                <label className="mb-1 block text-xs text-zinc-500">Name</label>
                                <input
                                  type="text"
                                  placeholder="Company name"
                                  value={requestData.name}
                                  onChange={(e) => setRequestData((prev) => ({ ...prev, name: e.target.value }))}
                                  className="w-full rounded-lg border border-white/[0.08] bg-white/[0.03] px-3 py-2 text-sm text-white placeholder-zinc-600 outline-none focus:border-indigo-500/50"
                                />
                              </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                              <div>
                                <label className="mb-1 block text-xs text-zinc-500">Type</label>
                                <div className="relative">
                                  <select
                                    value={requestData.type}
                                    onChange={(e) =>
                                      setRequestData((prev) => ({
                                        ...prev,
                                        type: e.target.value as AssetRequest["type"],
                                      }))
                                    }
                                    className="w-full appearance-none rounded-lg border border-white/[0.08] bg-white/[0.03] px-3 py-2 pr-8 text-sm text-white outline-none focus:border-indigo-500/50"
                                  >
                                    {assetTypes.map((t) => (
                                      <option key={t.value} value={t.value} className="bg-zinc-900">
                                        {t.label}
                                      </option>
                                    ))}
                                  </select>
                                  <ChevronDown className="pointer-events-none absolute right-2 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
                                </div>
                              </div>
                              <div>
                                <label className="mb-1 block text-xs text-zinc-500">Exchange</label>
                                <div className="relative">
                                  <select
                                    value={requestData.exchange}
                                    onChange={(e) => setRequestData((prev) => ({ ...prev, exchange: e.target.value }))}
                                    className="w-full appearance-none rounded-lg border border-white/[0.08] bg-white/[0.03] px-3 py-2 pr-8 text-sm text-white outline-none focus:border-indigo-500/50"
                                  >
                                    <option value="" className="bg-zinc-900">
                                      Select...
                                    </option>
                                    {exchanges.map((ex) => (
                                      <option key={ex.value} value={ex.value} className="bg-zinc-900">
                                        {ex.label}
                                      </option>
                                    ))}
                                  </select>
                                  <ChevronDown className="pointer-events-none absolute right-2 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
                                </div>
                              </div>
                            </div>

                            <div className="flex gap-2">
                              <button
                                onClick={() => setShowRequestForm(false)}
                                className="flex-1 rounded-lg border border-white/[0.08] py-2 text-sm text-zinc-400 transition-colors hover:bg-white/[0.03]"
                              >
                                Cancel
                              </button>
                              <button
                                onClick={handleRequestAsset}
                                disabled={!requestData.symbol || requestSubmitted}
                                className={cn(
                                  "flex-1 rounded-lg py-2 text-sm font-medium transition-all",
                                  requestSubmitted
                                    ? "bg-emerald-500/20 text-emerald-400"
                                    : "bg-indigo-500 text-white hover:bg-indigo-400 disabled:opacity-50",
                                )}
                              >
                                {requestSubmitted ? (
                                  <span className="flex items-center justify-center gap-2">
                                    <CheckCircle2 className="h-4 w-4" />
                                    Submitted!
                                  </span>
                                ) : (
                                  "Submit Request"
                                )}
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <>
                  {/* Selected Asset Form */}
                  <div className="mb-6 flex items-center gap-3 rounded-xl bg-indigo-500/10 p-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/[0.08] text-lg font-medium text-white">
                      {(selectedAsset as { icon?: string }).icon || selectedAsset.symbol.slice(0, 2)}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-white">{selectedAsset.symbol}</p>
                      <p className="text-sm text-zinc-400">{selectedAsset.name}</p>
                    </div>
                    <button onClick={() => setSelectedAsset(null)} className="text-xs text-zinc-500 hover:text-white">
                      Change
                    </button>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="mb-2 block text-sm text-zinc-400">Quantity</label>
                      <input
                        type="number"
                        placeholder="0.00"
                        value={quantity}
                        onChange={(e) => setQuantity(e.target.value)}
                        className="w-full rounded-xl border border-white/[0.08] bg-white/[0.03] px-4 py-3 text-white placeholder-zinc-500 outline-none transition-colors focus:border-indigo-500/50"
                      />
                    </div>
                    <div>
                      <label className="mb-2 block text-sm text-zinc-400">Price per unit ($)</label>
                      <input
                        type="number"
                        placeholder="0.00"
                        value={pricePerUnit}
                        onChange={(e) => setPricePerUnit(e.target.value)}
                        className="w-full rounded-xl border border-white/[0.08] bg-white/[0.03] px-4 py-3 text-white placeholder-zinc-500 outline-none transition-colors focus:border-indigo-500/50"
                      />
                    </div>

                    {quantity && pricePerUnit && (
                      <div className="rounded-xl bg-white/[0.03] p-4">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-zinc-400">Total Value</span>
                          <span className="text-xl font-semibold text-white">
                            $
                            {(Number.parseFloat(quantity) * Number.parseFloat(pricePerUnit)).toLocaleString("en-US", {
                              minimumFractionDigits: 2,
                            })}
                          </span>
                        </div>
                      </div>
                    )}

                    <button
                      onClick={handleAddAsset}
                      disabled={!quantity || !pricePerUnit}
                      className="w-full rounded-xl bg-emerald-600 py-3 font-medium text-white transition-colors hover:bg-emerald-500 disabled:opacity-50"
                    >
                      Add to Portfolio
                    </button>
                  </div>
                </>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
