import { useParams } from "react-router";
import { usePortfolioStore } from "@/stores/portfolio-store";

export default function StagePage() {
    const { stageId } = useParams();
    const { stages } = usePortfolioStore();
    const stage = stages.find((s) => s.id === stageId);

    if (!stage) {
        return <div className="px-8 py-6 text-zinc-400">Stage not found.</div>;
    }

    return (
        <div className="px-8 py-6">
            <h2 className="font-serif text-2xl font-light text-white mb-4">{stage.name}</h2>
            <div className="text-sm text-zinc-400">Total value: ${stage.totalValue.toLocaleString()}</div>
        </div>
    );
}
