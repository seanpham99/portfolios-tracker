import { PortfolioSelector } from "@/components/dashboard/portfolio-selector";
import { PortfolioHistoryChart } from "@/components/dashboard/portfolio-history-chart";
import { AllocationDonut } from "@/components/dashboard/allocation-donut";
import { UnifiedHoldingsTable } from "@/components/dashboard/unified-holdings-table";

export function UnifiedDashboardLayout() {
  return (
    <div className="flex h-full flex-col">
      {/* Top Bar: Portfolio Selector */}
      <div className="border-b border-white/[0.06] px-8 py-6">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <PortfolioSelector />
          <div className="flex items-center gap-6">
             {/* Summary Stats - Quick Glance */}
            <div className="flex flex-col items-end">
              <span className="mb-px text-xs font-medium text-zinc-500">Unrealized P/L</span>
              <span className="font-mono text-sm font-medium text-emerald-400">+$12,450.00</span>
            </div>
            <div className="h-8 w-px bg-white/10" />
            <div className="flex flex-col items-end">
              <span className="mb-px text-xs font-medium text-zinc-500">Net Worth</span>
              <span className="font-serif text-3xl font-light tracking-tight text-white">$65,450.00</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content: Scrollable */}
      <div className="flex-1 overflow-y-auto p-8">
        <div className="mx-auto max-w-7xl space-y-6">
          
          {/* Top Row: Charts */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <PortfolioHistoryChart />
            </div>
            <div>
              <AllocationDonut />
            </div>
          </div>

          {/* Bottom Row: Holdings Table */}
          <div>
            <UnifiedHoldingsTable />
          </div>

        </div>
      </div>
    </div>
  );
}
