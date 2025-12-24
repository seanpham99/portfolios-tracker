"use client"

import { useEffect, useState } from "react"
import { RefreshCw } from "lucide-react"
import { cn } from "@repo/ui/lib/utils"
import { usePortfolioStore, portfolioStore } from "@/stores/portfolio-store"

export function LiveIndicator() {
  const { lastUpdated, settings } = usePortfolioStore()
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [timeAgo, setTimeAgo] = useState("just now")

  // Update time ago display
  useEffect(() => {
    const updateTimeAgo = () => {
      const seconds = Math.floor((Date.now() - lastUpdated.getTime()) / 1000)
      if (seconds < 5) setTimeAgo("just now")
      else if (seconds < 60) setTimeAgo(`${seconds}s ago`)
      else setTimeAgo(`${Math.floor(seconds / 60)}m ago`)
    }
    updateTimeAgo()
    const interval = setInterval(updateTimeAgo, 1000)
    return () => clearInterval(interval)
  }, [lastUpdated])

  // Auto-refresh based on settings
  useEffect(() => {
    const interval = setInterval(() => {
      portfolioStore.updatePrices()
    }, settings.refreshInterval * 1000)
    return () => clearInterval(interval)
  }, [settings.refreshInterval])

  const handleRefresh = () => {
    setIsRefreshing(true)
    portfolioStore.updatePrices()
    setTimeout(() => setIsRefreshing(false), 500)
  }

  return (
    <div className="flex items-center gap-3">
      {/* Live pulse */}
      <div className="flex items-center gap-2">
        <span className="relative flex h-2 w-2">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
        </span>
        <span className="text-xs text-zinc-500">Live</span>
      </div>

      {/* Last updated */}
      <span className="text-xs text-zinc-600">Updated {timeAgo}</span>

      {/* Refresh button */}
      <button
        onClick={handleRefresh}
        disabled={isRefreshing}
        className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/[0.08] bg-white/[0.03] text-zinc-400 transition-all hover:border-white/[0.15] hover:bg-white/[0.05] hover:text-white disabled:opacity-50"
      >
        <RefreshCw className={cn("h-4 w-4", isRefreshing && "animate-spin")} />
      </button>
    </div>
  )
}
