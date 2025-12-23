import { usePortfolioStore } from "@/stores/portfolio-store";

export default function AnalyticsPage() {
    const { stages } = usePortfolioStore();
    const total = stages.reduce((sum, s) => sum + s.totalValue, 0);
    return (
        <div className="px-8 py-6">
            <h2 className="font-serif text-2xl font-light text-white mb-4">Analytics</h2>
            <p className="text-sm text-zinc-400">Portfolio total: ${total.toLocaleString()}</p>
            <p className="text-xs text-zinc-600 mt-2">(Placeholder page; move charts here.)</p>
        </div>
    );
}
