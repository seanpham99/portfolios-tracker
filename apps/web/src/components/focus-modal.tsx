"use client"

import { useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { X, TrendingUp, TrendingDown, ArrowUpRight, ArrowDownRight } from "lucide-react"
import type { Asset } from "./asset-blade"
import { Sparkline } from "./sparkline"
import { cn } from "@repo/ui/lib/utils"
import { Button } from "@repo/ui/components/button"
import { TransactionModal } from "./transaction-modal"

interface FocusModalProps {
  asset: Asset | null
  onClose: () => void
  timeframe: string
  onTimeframeChange: (tf: string) => void
}

const timeframes = ["1D", "1W", "1M", "3M", "YTD", "1Y"]

export function FocusModal({ asset, onClose, timeframe, onTimeframeChange }: FocusModalProps) {
  const [transactionType, setTransactionType] = useState<"buy" | "sell" | null>(null)

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose()
    }
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [onClose])

  if (!asset) return null

  const isPositive = asset.change >= 0

  return (
    <AnimatePresence>
      {asset && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="relative w-full max-w-2xl rounded-3xl border border-white/10 bg-zinc-900/95 p-8 shadow-2xl backdrop-blur-xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full bg-white/5 transition-colors hover:bg-white/10"
            >
              <X className="h-4 w-4" />
            </button>

            {/* Header */}
            <div className="mb-6 flex items-start gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/[0.08] text-2xl font-medium">
                {asset.icon || asset.symbol.slice(0, 2)}
              </div>
              <div className="flex-1">
                <h2 className="font-serif text-3xl font-light text-white">{asset.name}</h2>
                <p className="text-zinc-500">{asset.symbol}</p>
              </div>
              <div className="text-right">
                <p className="text-3xl font-semibold tabular-nums text-white">
                  ${asset.value.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </p>
                <div
                  className={cn(
                    "mt-1 inline-flex items-center gap-1 rounded-full px-3 py-1 text-sm font-medium",
                    isPositive ? "bg-emerald-500/10 text-emerald-400" : "bg-rose-500/10 text-rose-400",
                  )}
                >
                  {isPositive ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                  {isPositive ? "+" : ""}
                  {asset.change.toFixed(2)}%
                </div>
              </div>
            </div>

            {/* Timeframe Selector */}
            <div className="mb-4 flex gap-2">
              {timeframes.map((tf) => (
                <button
                  key={tf}
                  onClick={() => onTimeframeChange(tf)}
                  className={cn(
                    "rounded-lg px-4 py-2 text-sm font-medium transition-all",
                    timeframe === tf ? "bg-white/10 text-white" : "text-zinc-500 hover:bg-white/5 hover:text-zinc-300",
                  )}
                >
                  {tf}
                </button>
              ))}
            </div>

            {/* Large Chart */}
            <div className="mb-6 flex h-48 items-center justify-center rounded-2xl bg-white/[0.02] p-4">
              <Sparkline
                data={asset.sparklineData}
                color={isPositive ? "#10b981" : "#f43f5e"}
                width={540}
                height={160}
                strokeWidth={2.5}
              />
            </div>

            {/* Quick Actions */}
            <div className="flex gap-3">
              <Button
                onClick={() => setTransactionType("buy")}
                className="flex-1 gap-2 bg-emerald-600 hover:bg-emerald-500"
              >
                <ArrowUpRight className="h-4 w-4" />
                Buy
              </Button>
              <Button
                onClick={() => setTransactionType("sell")}
                variant="outline"
                className="flex-1 gap-2 border-rose-500/30 text-rose-400 hover:bg-rose-500/10 bg-transparent"
              >
                <ArrowDownRight className="h-4 w-4" />
                Sell
              </Button>
            </div>
          </motion.div>
        </motion.div>
      )}

      {/* Transaction Modal */}
      {transactionType && (
        <TransactionModal
          isOpen={!!transactionType}
          onClose={() => setTransactionType(null)}
          asset={asset!}
          type={transactionType}
        />
      )}
    </AnimatePresence>
  )
}
