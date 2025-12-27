import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { DashboardLayout } from './dashboard-layout';

describe('DashboardLayout', () => {
  it('should render all three tabs', () => {
    render(<DashboardLayout />);
    
    expect(screen.getByText('VN Stocks')).toBeInTheDocument();
    expect(screen.getByText('US Equities')).toBeInTheDocument();
    expect(screen.getByText('Crypto')).toBeInTheDocument();
  });

  it('should show first tab (VN Stocks) as active by default', () => {
    render(<DashboardLayout />);
    
    const vnTab = screen.getByText('VN Stocks').closest('button');
    expect(vnTab).toHaveAttribute('aria-selected', 'true');
  });

  it('should switch tabs when clicked', () => {
    render(<DashboardLayout />);
    
    const usEquitiesTab = screen.getByText('US Equities').closest('button');
    fireEvent.click(usEquitiesTab!);
    
    expect(usEquitiesTab).toHaveAttribute('aria-selected', 'true');
  });

  it('should display badges with asset count and total value', () => {
    render(<DashboardLayout />);
    
    // Check for badge elements - they should contain numbers
    const badges = screen.getAllByText(/\d+/);
    expect(badges.length).toBeGreaterThan(0);
  });

  it('should support keyboard shortcuts Cmd/Ctrl + 1/2/3', () => {
    render(<DashboardLayout />);
    
    // Trigger Cmd+2 for US Equities
    fireEvent.keyDown(document, { key: '2', metaKey: true });
    
    const usEquitiesTab = screen.getByText('US Equities').closest('button');
    expect(usEquitiesTab).toHaveAttribute('aria-selected', 'true');
  });

  it('should animate tab transitions with framer-motion', () => {
    const { container } = render(<DashboardLayout />);
    
    // Check that motion components are rendered
    const motionElements = container.querySelectorAll('[data-framer-component]');
    // Note: This is a basic check - actual animation testing would require more sophisticated tools
    expect(motionElements.length).toBeGreaterThan(0);
  });
});
