import { render, screen } from '@testing-library/react';
import { UnifiedDashboardLayout } from '@/components/unified-dashboard-layout';
import { describe, it, expect, vi } from 'vitest';
import { MemoryRouter } from 'react-router';

// Mock ResizeObserver
global.ResizeObserver = class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
};

// Mock Recharts to avoid sizing issues in JSDOM
vi.mock('recharts', async (importOriginal) => {
  const actual = await importOriginal<typeof import('recharts')>();
  return {
    ...actual,
    ResponsiveContainer: ({ children }: { children: any }) => <div style={{ width: 800, height: 800 }}>{children}</div>,
  };
});

describe('UnifiedDashboardLayout', () => {
  it('should render the portfolio selector', () => {
    render(
      <MemoryRouter>
        <UnifiedDashboardLayout />
      </MemoryRouter>
    );
    expect(screen.getByText('Portfolio')).toBeInTheDocument();
  });

  it('should render the summary stats', () => {
    render(
      <MemoryRouter>
        <UnifiedDashboardLayout />
      </MemoryRouter>
    );
    expect(screen.getByText('Net Worth')).toBeInTheDocument();
    expect(screen.getByText('Unrealized P/L')).toBeInTheDocument();
  });

  it('should render the charts and table', () => {
    render(
      <MemoryRouter>
        <UnifiedDashboardLayout />
      </MemoryRouter>
    );
    // Charts titles
    expect(screen.getByText('Net Worth History')).toBeInTheDocument();
    expect(screen.getByText('Allocation')).toBeInTheDocument();
    // Table title
    expect(screen.getByText('Holdings')).toBeInTheDocument();
  });

  // Add more tests as interactivity increases
});
