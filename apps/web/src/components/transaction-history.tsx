"use client"

import { motion } from "framer-motion"
import { ArrowUpRight, ArrowDownRight, History } from "lucide-react"
import { cn } from "@repo/ui/lib/utils"
import { usePortfolioStore, type Transaction } from "@/stores/portfolio-store"
import { GlassCard } from "./glass-card"

function formatDate(date: Date): string {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(date)
}

export function TransactionHistory() {
  const { transactions } = usePortfolioStore()

  if (transactions.length === 0) {
    return (
      <GlassCard className="p-6" hover={false}>
        <div className="flex items-center gap-2 mb-4">
          <History className="h-5 w-5 text-zinc-500" />
          <h3 className="text-lg font-medium text-white">Transaction History</h3>
        </div>
        <div className="py-8 text-center text-sm text-zinc-500">
          No transactions yet. Buy or sell assets to see your history.
        </div>
      </GlassCard>
    )
  }

  return (
    <GlassCard className="p-6" hover={false}>
      <div className="flex items-center gap-2 mb-4">
        <History className="h-5 w-5 text-zinc-500" />
        <h3 className="text-lg font-medium text-white">Transaction History</h3>
      </div>
      <div className="space-y-2 max-h-80 overflow-y-auto">
        {transactions.map((tx, i) => (
          <TransactionItem key={tx.id} transaction={tx} index={i} />
        ))}
      </div>
    </GlassCard>
  )
}

function TransactionItem({ transaction, index }: { transaction: Transaction; index: number }) {
  const isBuy = transaction.type === "buy"

  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.05 }}
      className="flex items-center justify-between rounded-xl bg-white/[0.03] p-3"
    >
      <div className="flex items-center gap-3">
        <div
          className={cn(
            "flex h-8 w-8 items-center justify-center rounded-lg",
            isBuy ? "bg-emerald-500/10 text-emerald-400" : "bg-rose-500/10 text-rose-400",
          )}
        >
          {isBuy ? <ArrowUpRight className="h-4 w-4" /> : <ArrowDownRight className="h-4 w-4" />}
        </div>
        <div>
          <p className="text-sm font-medium text-white">
            {isBuy ? "Bought" : "Sold"} {transaction.symbol}
          </p>
          <p className="text-xs text-zinc-500">{formatDate(transaction.timestamp)}</p>
        </div>
      </div>
      <div className="text-right">
        <p className={cn("text-sm font-medium tabular-nums", isBuy ? "text-emerald-400" : "text-rose-400")}>
          {isBuy ? "-" : "+"}${transaction.total.toLocaleString("en-US", { minimumFractionDigits: 2 })}
        </p>
        <p className="text-xs text-zinc-500">
          {transaction.quantity} @ ${transaction.price.toLocaleString()}
        </p>
      </div>
    </motion.div>
  )
}
