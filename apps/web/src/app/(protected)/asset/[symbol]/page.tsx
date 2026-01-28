import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, TrendingUp, Info } from "lucide-react";

import { mapToTradingViewSymbol } from "@/features/asset/utils/symbol-mapper";
import { getAsset } from "@/api/client";
import { MetricInfoCard, MetricKeys } from "@/features/metrics";

import { LazyAssetChart } from "@/features/asset/components/lazy-asset-chart";

import { createClient } from "@/lib/supabase/server";

interface AssetPageProps {
  params: Promise<{ symbol: string }>;
}

export default async function AssetPage({ params }: AssetPageProps) {
  const { symbol } = await params;
  const decodedSymbol = decodeURIComponent(symbol);

  // Get session token for authenticated request
  const supabase = await createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();
  const token = session?.access_token;

  // Fetch authoritative asset data from database
  const asset = await getAsset(decodedSymbol, token);

  if (!asset) {
    notFound(); // Show 404 if asset doesn't exist in database
  }

  // Map to TradingView symbol using database fields
  const tradingViewSymbol = mapToTradingViewSymbol({
    symbol: asset.symbol,
    asset_class: asset.asset_class,
    market: asset.market,
    exchange: asset.exchange,
  });

  return (
    <div className="min-h-screen bg-background p-4 lg:p-6">
      <div className="mx-auto max-w-[1920px] grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Header - Compact Row */}
        <header className="col-span-1 lg:col-span-12 flex flex-col items-start justify-between gap-4 border-b border-border-subtle pb-4 md:flex-row md:items-center">
          <div className="flex items-center gap-4">
            <Link
              href="/dashboard"
              className="group flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-surface/50 text-muted-foreground transition-all hover:border-border-medium hover:bg-surface-elevated hover:text-foreground"
            >
              <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-0.5" />
            </Link>

            <div className="flex items-center gap-3">
              <h1 className="flex items-center gap-2 text-xl font-bold tracking-tight text-foreground">
                <TrendingUp className="h-5 w-5 text-emerald-500" />
                {asset.symbol}
              </h1>
              <span className="h-4 w-px bg-border" />
              <p className="flex items-center gap-2 text-sm text-muted-foreground">
                {asset.name_en}
                <span className="text-muted-foreground/50">/</span>
                <span className="text-muted-foreground/70">{asset.name_local || asset.sector}</span>
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-1.5 rounded-md border border-emerald-500/20 bg-emerald-500/5 px-2.5 py-1 text-xs font-medium text-emerald-500">
              {asset.asset_class}
            </div>
            {asset.market && (
              <div className="flex items-center gap-1.5 rounded-md border border-blue-500/20 bg-blue-500/5 px-2.5 py-1 text-xs font-medium text-blue-500">
                {asset.market}
              </div>
            )}
            {asset.exchange && (
              <div className="flex items-center gap-1.5 rounded-md border border-purple-500/20 bg-purple-500/5 px-2.5 py-1 text-xs font-medium text-purple-500">
                {asset.exchange}
              </div>
            )}
          </div>
        </header>

        {/* Main Chart Section - Full width */}
        <section className="col-span-1 lg:col-span-12 flex flex-col gap-4">
          {/* Chart Toolbar/Header */}
          <div className="flex items-center justify-between px-1">
            <h2 className="text-sm font-semibold text-foreground">Price Performance</h2>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Info className="h-3.5 w-3.5" />
              <span>Real-time data via TradingView</span>
            </div>
          </div>

          {/* Chart Container */}
          <div className="relative h-[600px] w-full overflow-hidden rounded-xl border border-border-subtle bg-surface/50 shadow-inner">
            <LazyAssetChart symbol={tradingViewSymbol} />
          </div>
        </section>
      </div>
    </div>
  );
}
