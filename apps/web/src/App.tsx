"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { BarChart3, Settings, History } from "lucide-react"
import { StageSlider } from "@/components/stage-slider"
import { FocusModal } from "@/components/focus-modal"
import { AnalyticsOverlay } from "@/components/analytics-overlay"
import { NotificationCenter } from "@/components/notification-center"
import { LiveIndicator } from "@/components/live-indicator"
import { AddAssetModal } from "@/components/add-asset-modal"
import { TransactionHistory } from "@/components/transaction-history"
import type { Asset } from "@/components/asset-blade"
import { usePortfolioStore, useSettings } from "@/stores/portfolio-store"

// Static data for analytics (not live-updated)
const netWorthHistory = Array.from({ length: 30 }, (_, i) => {
  const base = 450000
  const trend = i * 2500
  const volatility = Math.random() * 15000 - 7500
  return base + trend + volatility
})

const aiInsights = [
  "Your tech allocation is 45% above benchmark. Consider diversifying into defensive sectors for balance.",
  "Bitcoin holdings show strong momentum. DCA opportunity detected based on 200-day moving average.",
  "Real estate REIT yields outperforming treasuries by 2.3%. Current allocation is optimal for income goals.",
]

export default function PortfolioTracker() {
  const { stages } = usePortfolioStore()
  const [currentStage, setCurrentStage] = useState(0)
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null)
  const [timeframe, setTimeframe] = useState("1M")
  const [showAnalytics, setShowAnalytics] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [showAddAsset, setShowAddAsset] = useState(false)
  const [addAssetStageId, setAddAssetStageId] = useState("")
  const [showHistory, setShowHistory] = useState(false)

  const totalValue = stages.reduce((sum, s) => sum + s.totalValue, 0)
  const totalChange = stages.reduce((sum, s) => sum + s.change * s.totalValue, 0) / totalValue

  const handleAddAsset = (stageId: string) => {
    setAddAssetStageId(stageId)
    setShowAddAsset(true)
  }

  return (
    <div className="flex h-screen flex-col bg-[#0a0a0b]">
      {/* Top Bar */}
      <header className="flex items-center justify-between border-b border-white/[0.06] px-8 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500/10">
            <span className="text-lg font-semibold text-emerald-400">F</span>
          </div>
          <span className="font-serif text-xl font-light tracking-tight text-white">Finsight</span>
        </div>

        <div className="flex items-center gap-4">
          <LiveIndicator />
          <div className="h-6 w-px bg-white/[0.08]" />
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowHistory(!showHistory)}
              className={`flex h-10 w-10 items-center justify-center rounded-xl border transition-all ${showHistory
                  ? "border-indigo-500/50 bg-indigo-500/10 text-indigo-400"
                  : "border-white/[0.08] bg-white/[0.03] text-zinc-400 hover:border-white/[0.15] hover:bg-white/[0.05] hover:text-white"
                }`}
            >
              <History className="h-5 w-5" />
            </button>
            <button
              onClick={() => setShowAnalytics(true)}
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/[0.08] bg-white/[0.03] text-zinc-400 transition-all hover:border-white/[0.15] hover:bg-white/[0.05] hover:text-white"
            >
              <BarChart3 className="h-5 w-5" />
            </button>
            <NotificationCenter />
            <button
              onClick={() => setShowSettings(true)}
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/[0.08] bg-white/[0.03] text-zinc-400 transition-all hover:border-white/[0.15] hover:bg-white/[0.05] hover:text-white"
            >
              <Settings className="h-5 w-5" />
            </button>
          </div>
        </div>
      </header>

      {/* Portfolio Summary */}
      <div className="border-b border-white/[0.06] px-8 py-6">
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-end gap-6">
          <div>
            <p className="mb-1 text-sm text-zinc-500">Total Portfolio Value</p>
            <motion.p
              key={Math.floor(totalValue)}
              initial={{ opacity: 0.5 }}
              animate={{ opacity: 1 }}
              className="font-serif text-5xl font-light tabular-nums tracking-tight text-white"
            >
              ${totalValue.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </motion.p>
          </div>
          <motion.div
            key={totalChange >= 0 ? "positive" : "negative"}
            initial={{ scale: 0.95 }}
            animate={{ scale: 1 }}
            className={`mb-2 rounded-full px-4 py-1.5 text-sm font-medium ${totalChange >= 0 ? "bg-emerald-500/10 text-emerald-400" : "bg-rose-500/10 text-rose-400"
              }`}
          >
            {totalChange >= 0 ? "+" : ""}
            {totalChange.toFixed(2)}% today
          </motion.div>
        </motion.div>
      </div>

      {/* Main Content Area */}
      <div className="flex flex-1 overflow-hidden">
        {/* Main Stage Area */}
        <main className={`flex-1 overflow-hidden py-8 transition-all ${showHistory ? "pr-0" : ""}`}>
          <StageSlider
            stages={stages}
            currentStage={currentStage}
            onStageChange={setCurrentStage}
            onAssetClick={setSelectedAsset}
            onAddAsset={handleAddAsset}
          />
        </main>

        {/* Transaction History Sidebar */}
        {showHistory && (
          <motion.aside
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="w-96 shrink-0 border-l border-white/[0.06] overflow-y-auto p-6"
          >
            <TransactionHistory />
          </motion.aside>
        )}
      </div>

      {/* Quick Stats Footer */}
      <footer className="border-t border-white/[0.06] px-8 py-4">
        <div className="flex items-center justify-between">
          <div className="flex gap-8">
            {stages.map((stage) => (
              <div key={stage.id} className="text-center">
                <p className="text-xs text-zinc-500">{stage.name}</p>
                <p className="tabular-nums text-sm text-zinc-300">${(stage.totalValue / 1000).toFixed(1)}K</p>
              </div>
            ))}
          </div>
          <p className="text-xs text-zinc-600">
            Use <kbd className="rounded bg-white/5 px-1.5 py-0.5 font-mono text-zinc-400">←</kbd>{" "}
            <kbd className="rounded bg-white/5 px-1.5 py-0.5 font-mono text-zinc-400">→</kbd> to navigate
          </p>
        </div>
      </footer>

      {/* Modals */}
      <FocusModal
        asset={selectedAsset}
        onClose={() => setSelectedAsset(null)}
        timeframe={timeframe}
        onTimeframeChange={setTimeframe}
      />
      <AnalyticsOverlay
        isOpen={showAnalytics}
        onClose={() => setShowAnalytics(false)}
        stages={stages}
        netWorthData={netWorthHistory}
        insights={aiInsights}
      />
      <AddAssetModal isOpen={showAddAsset} onClose={() => setShowAddAsset(false)} stageId={addAssetStageId} />
      {showSettings && <SettingsPanel onClose={() => setShowSettings(false)} />}
    </div>
  )
}

function SettingsPanel({ onClose }: { onClose: () => void }) {
  const { settings, updateSettings } = useSettings()

  return (
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
        className="w-full max-w-md rounded-2xl border border-white/[0.08] bg-zinc-900/95 p-6 shadow-2xl backdrop-blur-xl"
      >
        <h2 className="font-serif text-2xl font-light text-white mb-6">Settings</h2>

        {/* Currency */}
        <div className="mb-6">
          <label className="block text-sm text-zinc-400 mb-2">Currency</label>
          <div className="flex gap-2">
            {(["USD", "EUR", "GBP"] as const).map((currency) => (
              <button
                key={currency}
                onClick={() => updateSettings({ currency })}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${settings.currency === currency
                    ? "bg-indigo-500 text-white"
                    : "bg-white/[0.05] text-zinc-400 hover:bg-white/[0.08] hover:text-white"
                  }`}
              >
                {currency}
              </button>
            ))}
          </div>
        </div>

        {/* Refresh Interval */}
        <div className="mb-6">
          <label className="block text-sm text-zinc-400 mb-2">Auto-refresh interval: {settings.refreshInterval}s</label>
          <input
            type="range"
            min="10"
            max="120"
            step="10"
            value={settings.refreshInterval}
            onChange={(e) => updateSettings({ refreshInterval: Number(e.target.value) })}
            className="w-full accent-indigo-500"
          />
        </div>

        {/* Notification Preferences */}
        <div className="mb-6">
          <label className="block text-sm text-zinc-400 mb-3">Notifications</label>
          <div className="space-y-3">
            {[
              { key: "priceAlerts", label: "Price alerts" },
              { key: "dailySummary", label: "Daily summary" },
              { key: "significantMovements", label: "Significant movements" },
            ].map(({ key, label }) => (
              <label key={key} className="flex items-center justify-between cursor-pointer">
                <span className="text-sm text-zinc-300">{label}</span>
                <div
                  onClick={() =>
                    updateSettings({
                      notifications: {
                        ...settings.notifications,
                        [key]: !settings.notifications[key as keyof typeof settings.notifications],
                      },
                    })
                  }
                  className={`relative h-6 w-11 rounded-full transition-colors ${settings.notifications[key as keyof typeof settings.notifications] ? "bg-indigo-500" : "bg-zinc-700"
                    }`}
                >
                  <div
                    className={`absolute top-1 h-4 w-4 rounded-full bg-white transition-transform ${settings.notifications[key as keyof typeof settings.notifications]
                        ? "translate-x-6"
                        : "translate-x-1"
                      }`}
                  />
                </div>
              </label>
            ))}
          </div>
        </div>

        <button
          onClick={onClose}
          className="w-full py-3 rounded-xl bg-white/[0.05] text-zinc-300 font-medium hover:bg-white/[0.08] transition-colors"
        >
          Close
        </button>
      </motion.div>
    </motion.div>
  )
}
