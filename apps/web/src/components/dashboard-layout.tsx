import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useSearchParams } from "react-router";
import { cn } from "@repo/ui/lib/utils";

export type TabId = "vn" | "us" | "crypto";

export interface TabStats {
  assetCount: number;
  totalValue: number;
}

interface DashboardLayoutProps {
  stats?: Record<TabId, TabStats>;
}

interface TabDef {
  id: TabId;
  label: string;
}

const TABS: TabDef[] = [
  { id: "vn", label: "VN Stocks" },
  { id: "us", label: "US Equities" },
  { id: "crypto", label: "Crypto" },
];

const TAB_SHORTCUTS: Record<string, TabId> = {
  "1": "vn",
  "2": "us",
  "3": "crypto",
};

export function DashboardLayout({
  stats = {
    vn: { assetCount: 0, totalValue: 0 },
    us: { assetCount: 0, totalValue: 0 },
    crypto: { assetCount: 0, totalValue: 0 },
  },
}: DashboardLayoutProps) {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = (searchParams.get("view") as TabId) || "vn";

  const handleTabChange = (tabId: TabId) => {
    setSearchParams((prev) => {
      prev.set("view", tabId);
      return prev;
    });
  };

  // Keyboard shortcuts: Cmd/Ctrl + 1/2/3
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key in TAB_SHORTCUTS) {
        e.preventDefault();
        handleTabChange(TAB_SHORTCUTS[e.key]);
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <div className="flex h-full flex-col">
      {/* Tab Navigation */}
      <div className="border-b border-white/[0.06] px-8">
        <div
          className="flex gap-1"
          role="tablist"
          aria-label="Asset class tabs"
        >
          {TABS.map((tab) => {
            const isActive = activeTab === tab.id;
            const tabStats = stats[tab.id];

            return (
              <button
                key={tab.id}
                role="tab"
                aria-selected={isActive}
                // Only set aria-controls if the panel is actually mounted/visible
                aria-controls={isActive ? `panel-${tab.id}` : undefined}
                onClick={() => handleTabChange(tab.id)}
                className={cn(
                  "relative px-6 py-4 text-sm font-medium transition-colors",
                  "hover:text-white",
                  isActive ? "text-white" : "text-zinc-500",
                )}
              >
                <div className="flex items-center gap-3">
                  <span>{tab.label}</span>

                  {/* Badge: Asset Count & Total Value */}
                  <div
                    className={cn(
                      "flex items-center gap-2 rounded-full px-3 py-1 text-xs",
                      isActive
                        ? "bg-emerald-500/10 text-emerald-400"
                        : "bg-white/5 text-zinc-600",
                    )}
                  >
                    <span>{tabStats?.assetCount ?? 0} assets</span>
                    <span className="text-zinc-700">•</span>
                    <span>
                      {new Intl.NumberFormat("en-US", {
                        style: "currency",
                        currency: "USD",
                        minimumFractionDigits: 0,
                        maximumFractionDigits: 2,
                      }).format(tabStats?.totalValue ?? 0)}
                    </span>
                  </div>
                </div>

                {/* Active indicator */}
                {isActive && (
                  <motion.div
                    layoutId="active-tab-indicator"
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-500"
                    transition={{ duration: 0.2, ease: "easeInOut" }}
                  />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Tab Content with Animations */}
      <div className="flex-1 overflow-hidden">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={activeTab}
            id={`panel-${activeTab}`}
            role="tabpanel"
            aria-labelledby={`tab-${activeTab}`}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -30 }}
            transition={{ duration: 0.2, ease: "easeInOut" }}
            className="h-full p-8"
            data-framer-component="tab-content"
          >
            {/* Placeholder content for each tab */}
            <div className="flex h-full items-center justify-center">
              <div className="text-center">
                <h2 className="mb-2 font-serif text-3xl font-light text-white">
                  {TABS.find((t) => t.id === activeTab)?.label}
                </h2>
                <p className="text-sm text-zinc-500">
                  Content for this asset class will be displayed here
                </p>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
