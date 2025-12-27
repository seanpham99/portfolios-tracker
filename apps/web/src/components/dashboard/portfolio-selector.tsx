import { ChevronDown, Plus } from "lucide-react";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

const PORTFOLIOS = [
  { id: 'p1', name: 'Personal Wealth', type: 'Individual' },
  { id: 'p2', name: 'Family Trust', type: 'Joint' },
  { id: 'p3', name: 'Trading Bot', type: 'Speculative' },
];

export function PortfolioSelector() {
  const [isOpen, setIsOpen] = useState(false);
  const [selected, setSelected] = useState(PORTFOLIOS[0]);

  // Handle ESC to close
  useEffect(() => {
    const handleKeydown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsOpen(false);
    };
    if (isOpen) {
      window.addEventListener("keydown", handleKeydown);
    }
    return () => window.removeEventListener("keydown", handleKeydown);
  }, [isOpen]);

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm font-medium text-white hover:bg-white/10 transition-colors"
      >
        <div className="flex flex-col items-start text-left">
          <span className="text-xs text-zinc-500 font-normal">Portfolio</span>
          <span>{selected.name}</span>
        </div>
        <ChevronDown className={`h-4 w-4 text-zinc-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            className="absolute left-0 top-full z-50 mt-2 w-56 rounded-xl border border-white/10 bg-[#18181b] p-1 shadow-xl ring-1 ring-black/5"
          >
            <div className="py-1">
              <p className="px-3 py-1.5 text-xs font-medium text-zinc-500">Switch Portfolio</p>
              {PORTFOLIOS.map((p) => (
                <button
                  key={p.id}
                  onClick={() => {
                    setSelected(p);
                    setIsOpen(false);
                  }}
                  className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm transition-colors ${
                    selected.id === p.id ? 'bg-white/10 text-white' : 'text-zinc-400 hover:bg-white/5 hover:text-white'
                  }`}
                >
                  <span>{p.name}</span>
                  {selected.id === p.id && <div className="h-1.5 w-1.5 rounded-full bg-emerald-500" />}
                </button>
              ))}
            </div>
            <div className="border-t border-white/5 bg-white/[0.02] p-1">
              <button className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-emerald-400 hover:bg-emerald-500/10 transition-colors">
                <Plus className="h-4 w-4" />
                <span>Create Portfolio</span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
