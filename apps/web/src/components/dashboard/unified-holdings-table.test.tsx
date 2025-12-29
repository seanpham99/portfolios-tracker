import { render, screen } from "@testing-library/react";
import { UnifiedHoldingsTable } from "./unified-holdings-table";
import { useHoldings } from "../../api/hooks/use-holdings";
import { vi, describe, it, expect } from "vitest";
import React from "react";

// Mock hook
vi.mock("../../api/hooks/use-holdings", () => ({
  useHoldings: vi.fn(),
}));

describe("UnifiedHoldingsTable", () => {
  it("renders loading state", () => {
    (useHoldings as any).mockReturnValue({ data: [], isLoading: true });
    render(<UnifiedHoldingsTable />);
    expect(screen.getByText("Loading holdings...")).toBeInTheDocument();
  });

  it("renders holdings data", () => {
    (useHoldings as any).mockReturnValue({
      data: [
        {
          asset_id: "1",
          symbol: "AAPL",
          name: "Apple",
          asset_class: "US Equity",
          total_quantity: 10,
          avg_cost: 100,
          market: "US",
        },
      ],
      isLoading: false,
    });
    render(<UnifiedHoldingsTable />);
    expect(screen.getByText("AAPL")).toBeInTheDocument();
    expect(screen.getByText("Apple")).toBeInTheDocument();
    expect(screen.getByText("US Equity")).toBeInTheDocument();
  });
});
