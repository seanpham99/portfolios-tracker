"use client";

import { Sparkline } from "./sparkline";
import { GlassCard } from "./glass-card";
import { TrendingUp, TrendingDown } from "lucide-react";
import { cn } from "@repo/ui/lib/utils";

export interface Asset {
  id: string;
  symbol: string;
  name: string;
  value: number;
  change: number;
  allocation: number;
  sparklineData: number[];
  icon?: string;
}

interface AssetBladeProps {
  asset: Asset;
  index: number;
  onClick?: () => void;
}

export function AssetBlade({ asset, index, onClick }: AssetBladeProps) {
  const isPositive = asset.change >= 0;

  return (
    <GlassCard
      className="flex w-[280px] shrink-0 flex-col gap-4 p-5"
      delay={index * 0.1}
      onClick={onClick}
    >
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/[0.08] text-lg font-medium">
            {asset.icon || asset.symbol.slice(0, 2)}
          </div>
          <div>
            <h3 className="font-medium text-white">{asset.symbol}</h3>
            <p className="text-sm text-zinc-500">{asset.name}</p>
          </div>
        </div>
        <div
          className={cn(
            "flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium",
            isPositive
              ? "bg-emerald-500/10 text-emerald-400"
              : "bg-rose-500/10 text-rose-400",
          )}
        >
          {isPositive ? (
            <TrendingUp className="h-3 w-3" />
          ) : (
            <TrendingDown className="h-3 w-3" />
          )}
          {isPositive ? "+" : ""}
          {asset.change.toFixed(2)}%
        </div>
      </div>

      {/* Sparkline */}
      <div className="flex justify-center py-2">
        <Sparkline
          data={asset.sparklineData}
          color={isPositive ? "#10b981" : "#f43f5e"}
          width={240}
          height={50}
        />
      </div>

      {/* Footer */}
      <div className="flex items-end justify-between">
        <div>
          <p className="text-2xl font-semibold tabular-nums text-white">
            ${asset.value.toLocaleString("en-US", { minimumFractionDigits: 2 })}
          </p>
          <p className="text-xs text-zinc-500">
            {asset.allocation}% of portfolio
          </p>
        </div>
      </div>
    </GlassCard>
  );
}
