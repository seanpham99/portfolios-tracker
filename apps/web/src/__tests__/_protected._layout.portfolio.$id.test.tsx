import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router';
import PortfolioDetail from '../routes/_protected._layout.portfolio.$id';
import { useQuery } from '@tanstack/react-query';

// Mock everything used in the page
vi.mock('@/api/hooks/use-holdings', () => ({
  useHoldings: vi.fn(),
}));

// Mock Query for portfolio details (which might use a hook we haven't created yet or we might just use usePortfolios and find, 
// OR we should create usePortfolio(id) as part of cleanup. 
// For now, looking at the story, we might just assume we fetch it somehow.
// Actually, Story 2.8 doesn't explicitly ask for `usePortfolio(id)`, but Task 2 says "Display portfolio name...".
// The page probably needs to fetch portfolio details.
// Let's assume we implement a basic fetch or usePortfolios mock for now.
// Wait, the page will likely use `usePortfolios` or similar to get the name? 
// Or `getPortfolio(id)`. 
// Task 1 added `getPortfolios` and `getPortfolioHoldings`. `findOne` logic exists in backend.
// We should probably add `usePortfolio(id)` hook or just fetch it in the route loader/component.
// Let's mock `usePortfolio` if we decide to create it, or just mock the hook we'll use.

vi.mock('@/api/client', () => ({
  apiFetch: vi.fn(),
  getPortfolios: vi.fn(),
  getPortfolioHoldings: vi.fn(),
}));

vi.mock('@tanstack/react-query', async () => {
  const actual = await import('@tanstack/react-query');
  return {
    ...actual,
    useQuery: vi.fn(),
  }
});

vi.mock('@/components/dashboard/unified-holdings-table', () => ({
  UnifiedHoldingsTable: () => <div data-testid="holdings-table">Holdings Table</div>,
}));

vi.mock('@/components/dashboard/portfolio-history-chart', () => ({
  PortfolioHistoryChart: () => <div>Chart</div>,
}));

vi.mock('@/components/dashboard/allocation-donut', () => ({
  AllocationDonut: () => <div>Donut</div>,
}));

describe('Portfolio Detail Page', () => {
    it('renders 404/Empty when portfolio not found', () => {
        // Mock useQuery to return error or empty
        (useQuery as any).mockReturnValue({
            data: null,
            isLoading: false,
            isError: true,
        });

        render(
            <MemoryRouter initialEntries={['/portfolio/999']}>
                <Routes>
                    <Route path="/portfolio/:id" element={<PortfolioDetail />} />
                </Routes>
            </MemoryRouter>
        );

        expect(screen.getByText(/Portfolio not found/i)).toBeInTheDocument();
    });

    it('renders portfolio details and holdings table when found', () => {
        // Mock successful portfolio fetch
        (useQuery as any).mockReturnValue({
            data: [{ id: '123', name: 'My Growth Portfolio', base_currency: 'USD', netWorth: 50000 }],
            isLoading: false,
        });

        render(
            <MemoryRouter initialEntries={['/portfolio/123']}>
                <Routes>
                    <Route path="/portfolio/:id" element={<PortfolioDetail />} />
                </Routes>
            </MemoryRouter>
        );

        expect(screen.getByText('My Growth Portfolio')).toBeInTheDocument();
        expect(screen.getByTestId('holdings-table')).toBeInTheDocument();
    });
});
