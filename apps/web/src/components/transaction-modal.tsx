"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { X, ArrowUpRight, ArrowDownRight } from "lucide-react"
import { cn } from "@repo/ui/lib/utils"
import { portfolioStore } from "@/stores/portfolio-store"
import type { Asset } from "./asset-blade"

interface TransactionModalProps {
  isOpen: boolean
  onClose: () => void
  asset: Asset
  type: "buy" | "sell"
}

export function TransactionModal({ isOpen, onClose, asset, type }: TransactionModalProps) {
  const [quantity, setQuantity] = useState("")
  const [price, setPrice] = useState((asset.value / 100).toFixed(2))

  const isBuy = type === "buy"
  const total = Number.parseFloat(quantity || "0") * Number.parseFloat(price || "0")

  const handleSubmit = () => {
    if (!quantity || !price) return

    portfolioStore.addTransaction({
      assetId: asset.id,
      symbol: asset.symbol,
      type,
      quantity: Number.parseFloat(quantity),
      price: Number.parseFloat(price),
      total,
    })

    portfolioStore.addNotification({
      type: "portfolio_change",
      title: `${isBuy ? "Bought" : "Sold"} ${asset.symbol}`,
      message: `${isBuy ? "Purchased" : "Sold"} ${quantity} ${asset.symbol} at $${Number.parseFloat(price).toLocaleString()} per unit`,
      assetId: asset.id,
    })

    onClose()
    setQuantity("")
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md rounded-2xl border border-white/[0.08] bg-zinc-900/95 shadow-2xl backdrop-blur-xl"
          >
            {/* Header */}
            <div
              className={cn(
                "flex items-center justify-between border-b border-white/[0.08] px-6 py-4",
                isBuy ? "bg-emerald-500/5" : "bg-rose-500/5",
              )}
            >
              <div className="flex items-center gap-3">
                <div
                  className={cn(
                    "flex h-10 w-10 items-center justify-center rounded-xl",
                    isBuy ? "bg-emerald-500/10 text-emerald-400" : "bg-rose-500/10 text-rose-400",
                  )}
                >
                  {isBuy ? <ArrowUpRight className="h-5 w-5" /> : <ArrowDownRight className="h-5 w-5" />}
                </div>
                <div>
                  <h2 className="font-serif text-xl font-light text-white">
                    {isBuy ? "Buy" : "Sell"} {asset.symbol}
                  </h2>
                  <p className="text-xs text-zinc-500">{asset.name}</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="flex h-8 w-8 items-center justify-center rounded-full bg-white/5 transition-colors hover:bg-white/10"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              {/* Current Holdings */}
              <div className="rounded-xl bg-white/[0.03] p-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-zinc-500">Current Value</span>
                  <span className="font-medium text-white">
                    ${asset.value.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                  </span>
                </div>
              </div>

              {/* Quantity */}
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

              {/* Price */}
              <div>
                <label className="mb-2 block text-sm text-zinc-400">Price per unit ($)</label>
                <input
                  type="number"
                  placeholder="0.00"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  className="w-full rounded-xl border border-white/[0.08] bg-white/[0.03] px-4 py-3 text-white placeholder-zinc-500 outline-none transition-colors focus:border-indigo-500/50"
                />
              </div>

              {/* Total */}
              {total > 0 && (
                <div className={cn("rounded-xl p-4", isBuy ? "bg-emerald-500/10" : "bg-rose-500/10")}>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-zinc-400">Total {isBuy ? "Cost" : "Proceeds"}</span>
                    <span className={cn("text-xl font-semibold", isBuy ? "text-emerald-400" : "text-rose-400")}>
                      ${total.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                </div>
              )}

              {/* Submit */}
              <button
                onClick={handleSubmit}
                disabled={!quantity || !price}
                className={cn(
                  "w-full rounded-xl py-3 font-medium text-white transition-colors disabled:opacity-50",
                  isBuy ? "bg-emerald-600 hover:bg-emerald-500" : "bg-rose-600 hover:bg-rose-500",
                )}
              >
                Confirm {isBuy ? "Purchase" : "Sale"}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
