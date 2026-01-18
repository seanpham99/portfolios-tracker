import { useQuery } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { PortfolioSnapshotDto } from "@workspace/shared-types/api";

type Range = "1D" | "1W" | "1M" | "3M" | "1Y" | "ALL";

interface UsePortfolioHistoryOptions {
  range?: Range;
  enabled?: boolean;
}

export function usePortfolioHistory(
  portfolioId: string | undefined,
  options: UsePortfolioHistoryOptions = {}
) {
  const { range = "1M", enabled = true } = options;
  const supabase = createClient();

  return useQuery({
    queryKey: ["portfolio-history", portfolioId, range],
    queryFn: async () => {
      if (!portfolioId) throw new Error("Portfolio ID required");

      const response = await fetch(`/api/portfolios/${portfolioId}/history?range=${range}`);

      if (!response.ok) {
        throw new Error("Failed to fetch history");
      }

      const json = await response.json();
      return json.data as PortfolioSnapshotDto[];
    },
    enabled: !!portfolioId && enabled,
    staleTime: 1000 * 60 * 5, // 5 minutes staleness for history
  });
}
