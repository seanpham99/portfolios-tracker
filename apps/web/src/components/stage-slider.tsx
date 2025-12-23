"use client"
import { useRef, useEffect, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ChevronLeft, ChevronRight, Plus } from "lucide-react"
import { AssetBlade, type Asset } from "./asset-blade"
import { cn } from "@/lib/utils"

export interface Stage {
  id: string
  name: string
  assets: Asset[]
  totalValue: number
  change: number
}

interface StageSliderProps {
  stages: Stage[]
  currentStage: number
  onStageChange: (index: number) => void
  onAssetClick?: (asset: Asset) => void
  onAddAsset?: (stageId: string) => void
}

export function StageSlider({ stages, currentStage, onStageChange, onAssetClick, onAddAsset }: StageSliderProps) {
  const scrollRef = useRef<HTMLDivElement>(null)

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft" && currentStage > 0) {
        onStageChange(currentStage - 1)
      } else if (e.key === "ArrowRight" && currentStage < stages.length - 1) {
        onStageChange(currentStage + 1)
      }
    },
    [currentStage, stages.length, onStageChange],
  )

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [handleKeyDown])

  const stage = stages[currentStage]
  const isPositive = stage.change >= 0

  return (
    <div className="flex h-full flex-col">
      {/* Stage Header */}
      <div className="mb-8 flex items-center justify-between px-8">
        <div>
          <motion.h2
            key={stage.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="font-serif text-4xl font-light tracking-tight text-white"
          >
            {stage.name}
          </motion.h2>
          <div className="mt-2 flex items-center gap-4">
            <span className="text-2xl tabular-nums text-zinc-400">
              ${stage.totalValue.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
            <span
              className={cn(
                "rounded-full px-3 py-1 text-sm font-medium",
                isPositive ? "bg-emerald-500/10 text-emerald-400" : "bg-rose-500/10 text-rose-400",
              )}
            >
              {isPositive ? "+" : ""}
              {stage.change.toFixed(2)}%
            </span>
          </div>
        </div>

        {/* Navigation + Add */}
        <div className="flex items-center gap-3">
          {onAddAsset && (
            <button
              onClick={() => onAddAsset(stage.id)}
              className="flex h-10 items-center gap-2 rounded-xl border border-indigo-500/30 bg-indigo-500/10 px-4 text-sm font-medium text-indigo-400 transition-all hover:border-indigo-500/50 hover:bg-indigo-500/20"
            >
              <Plus className="h-4 w-4" />
              Add Asset
            </button>
          )}
          <div className="h-6 w-px bg-white/[0.08]" />
          <button
            onClick={() => onStageChange(Math.max(0, currentStage - 1))}
            disabled={currentStage === 0}
            className={cn(
              "flex h-10 w-10 items-center justify-center rounded-full border border-white/10 transition-all",
              currentStage === 0 ? "cursor-not-allowed opacity-30" : "hover:border-white/20 hover:bg-white/5",
            )}
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            onClick={() => onStageChange(Math.min(stages.length - 1, currentStage + 1))}
            disabled={currentStage === stages.length - 1}
            className={cn(
              "flex h-10 w-10 items-center justify-center rounded-full border border-white/10 transition-all",
              currentStage === stages.length - 1
                ? "cursor-not-allowed opacity-30"
                : "hover:border-white/20 hover:bg-white/5",
            )}
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Asset Cards */}
      <div className="flex-1 overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={stage.id}
            ref={scrollRef}
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -100 }}
            transition={{ duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="flex gap-4 overflow-x-auto px-8 pb-4 scrollbar-hide"
            style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
          >
            {stage.assets.map((asset, index) => (
              <AssetBlade key={asset.id} asset={asset} index={index} onClick={() => onAssetClick?.(asset)} />
            ))}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Progress Bar */}
      <div className="mt-6 flex items-center justify-center gap-2 px-8">
        {stages.map((s, i) => (
          <button key={s.id} onClick={() => onStageChange(i)} className="group flex items-center gap-2">
            <div
              className={cn(
                "h-1 rounded-full transition-all duration-300",
                i === currentStage ? "w-8 bg-emerald-500" : "w-4 bg-white/20 group-hover:bg-white/40",
              )}
            />
          </button>
        ))}
      </div>
    </div>
  )
}
