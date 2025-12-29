import { motion, useReducedMotion } from "framer-motion";
import { CalculationMethod } from "@repo/api-types";
import { Info, Calculator } from "lucide-react";

interface MethodologyPanelProps {
  calculationMethod?: CalculationMethod;
  dataSource?: string;
}

// Animation constants for consistency
const ANIMATION_DURATION = 0.2;

const METHODOLOGY_CONTENT: Record<
  CalculationMethod,
  { title: string; formula: string; description: string }
> = {
  [CalculationMethod.WEIGHTED_AVG]: {
    title: "Weighted Average Cost Basis",
    formula: "Avg Cost = Total Cost of All Purchases / Total Quantity",
    description:
      "Each purchase updates the average cost proportionally. When you sell, the cost basis reduces using the current average.",
  },
  [CalculationMethod.FIFO]: {
    title: "First-In, First-Out (FIFO)",
    formula: "Cost Basis = Oldest Purchased Shares Sold First",
    description:
      "When you sell assets, the cost basis is calculated from the earliest purchases first.",
  },
};

export function MethodologyPanel({
  calculationMethod,
  dataSource,
}: MethodologyPanelProps) {
  const content = calculationMethod
    ? METHODOLOGY_CONTENT[calculationMethod]
    : null;
  const prefersReducedMotion = useReducedMotion();

  // Respect prefers-reduced-motion (AC 4)
  const animationProps = prefersReducedMotion
    ? { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 } }
    : {
        initial: { height: 0, opacity: 0 },
        animate: { height: "auto", opacity: 1 },
        exit: { height: 0, opacity: 0 },
      };

  return (
    <motion.div
      {...animationProps}
      transition={{
        duration: prefersReducedMotion ? 0 : ANIMATION_DURATION,
        ease: "easeInOut",
      }}
      className="overflow-hidden"
      style={
        prefersReducedMotion ? undefined : { willChange: "height, opacity" }
      }
    >
      <div className="border-t border-white/5 bg-white/[0.02] px-6 py-4">
        <div className="flex items-start gap-4">
          {/* Icon */}
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-500/10">
            <Calculator className="h-5 w-5 text-blue-400" />
          </div>

          {/* Content */}
          <div className="flex-1 space-y-3">
            {content && (
              <>
                <div>
                  <h4 className="font-medium text-white">{content.title}</h4>
                  <p className="mt-1 text-sm text-zinc-400">
                    {content.description}
                  </p>
                </div>

                <div className="rounded-lg border border-white/10 bg-white/5 px-4 py-3">
                  <div className="flex items-center gap-2 text-xs font-medium text-zinc-400">
                    <Info className="h-3.5 w-3.5" />
                    Formula
                  </div>
                  <code className="mt-1 block font-mono text-sm text-blue-300">
                    {content.formula}
                  </code>
                </div>
              </>
            )}

            {dataSource && (
              <div className="flex items-center gap-2 text-xs text-zinc-500">
                <span className="font-medium">Data Source:</span>
                <span className="rounded-full bg-white/5 px-2 py-0.5 text-zinc-300">
                  {dataSource}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
