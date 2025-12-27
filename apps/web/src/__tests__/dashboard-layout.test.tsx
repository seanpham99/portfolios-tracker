import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { DashboardLayout } from '../components/dashboard-layout';

describe('DashboardLayout', () => {
  it('should render all three tabs', () => {
    render(
      <MemoryRouter>
        <DashboardLayout />
      </MemoryRouter>
    );
    
    const tabs = screen.getAllByRole('tab');
    expect(tabs).toHaveLength(3);
    expect(tabs[0]).toHaveTextContent('VN Stocks');
    expect(tabs[1]).toHaveTextContent('US Equities');
    expect(tabs[2]).toHaveTextContent('Crypto');
  });

  it('should show first tab (VN Stocks) as active by default', () => {
    render(
      <MemoryRouter>
        <DashboardLayout />
      </MemoryRouter>
    );
    
    const tabs = screen.getAllByRole('tab');
    expect(tabs[0]).toHaveAttribute('aria-selected', 'true');
    expect(tabs[1]).toHaveAttribute('aria-selected', 'false');
    expect(tabs[2]).toHaveAttribute('aria-selected', 'false');
  });

  it('should switch tabs when clicked', () => {
    render(
      <MemoryRouter>
        <DashboardLayout />
      </MemoryRouter>
    );
    
    const tabs = screen.getAllByRole('tab');
    
    // Click US Equities tab (index 1)
    fireEvent.click(tabs[1]);
    
    // Verify US Equities is now active
    expect(tabs[1]).toHaveAttribute('aria-selected', 'true');
    expect(tabs[0]).toHaveAttribute('aria-selected', 'false');
  });

  it('should display badges with asset count and total value', () => {
    render(
      <MemoryRouter>
        <DashboardLayout />
      </MemoryRouter>
    );
    
    // Check for badge text containing "assets"
    expect(screen.getAllByText(/assets/).length).toBeGreaterThan(0);
    // Check for dollar signs indicating value
    expect(screen.getAllByText(/\$/)).toHaveLength(3);
  });

  it('should support keyboard shortcuts Cmd/Ctrl + 1/2/3', () => {
    render(
      <MemoryRouter>
        <DashboardLayout />
      </MemoryRouter>
    );
    
    const tabs = screen.getAllByRole('tab');
    
    // Trigger Cmd+2 for US Equities
    fireEvent.keyDown(document, { key: '2', metaKey: true });
    
    expect(tabs[1]).toHaveAttribute('aria-selected', 'true');
  });

  it('should have proper ARIA attributes for accessibility', () => {
    render(
      <MemoryRouter>
        <DashboardLayout />
      </MemoryRouter>
    );
    
    const tablist = screen.getByRole('tablist');
    expect(tablist).toBeInTheDocument();
    
    const tabs = screen.getAllByRole('tab');
    expect(tabs).toHaveLength(3);
    
    const tabpanel = screen.getByRole('tabpanel');
    expect(tabpanel).toBeInTheDocument();
  });
});
