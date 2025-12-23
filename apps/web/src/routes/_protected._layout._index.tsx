import { motion } from "framer-motion";
import { StageSlider } from "@/components/stage-slider";
import { usePortfolioStore } from "@/stores/portfolio-store";

export default function Home() {
    const { stages } = usePortfolioStore();
    const totalValue = stages.reduce((sum, s) => sum + s.totalValue, 0);
    const totalChange = stages.reduce((sum, s) => sum + s.change * s.totalValue, 0) / totalValue;

    return (
        <div className="flex h-full flex-col">
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
                        className={`mb-2 rounded-full px-4 py-1.5 text-sm font-medium ${totalChange >= 0 ? "bg-emerald-500/10 text-emerald-400" : "bg-rose-500/10 text-rose-400"}`}
                    >
                        {totalChange >= 0 ? "+" : ""}
                        {totalChange.toFixed(2)}% today
                    </motion.div>
                </motion.div>
            </div>

            <div className="flex-1 overflow-hidden py-8">
                <StageSlider
                    stages={stages}
                    currentStage={0}
                    onStageChange={() => { }}
                    onAssetClick={() => { }}
                    onAddAsset={() => { }}
                />
            </div>
        </div>
    );
}
