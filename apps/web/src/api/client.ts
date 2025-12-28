import { type PortfolioSummaryDto, type HoldingDto } from '@repo/api-types';
import { apiFetch } from '@/lib/api';

export * from '@/lib/api';

/**
 * Fetch all portfolios with summary data
 */
export async function getPortfolios(): Promise<PortfolioSummaryDto[]> {
  const response = await apiFetch('/portfolios');
  if (!response.ok) {
    throw new Error('Failed to fetch portfolios');
  }
  return response.json();
}


/**
 * Fetch a specific portfolio by ID
 */
export async function getPortfolio(id: string): Promise<PortfolioSummaryDto> {
  const response = await apiFetch(`/portfolios/${id}`);
  if (!response.ok) {
    throw new Error('Failed to fetch portfolio');
  }
  return response.json();
}

/**
 * Fetch holdings for a specific portfolio
 */
export async function getPortfolioHoldings(portfolioId: string): Promise<HoldingDto[]> {
  const response = await apiFetch(`/portfolios/${portfolioId}/holdings`);
  if (!response.ok) {
    throw new Error('Failed to fetch portfolio holdings');
  }
  return response.json();
}

/**
 * Fetch all holdings across all portfolios
 */
export async function getAllHoldings(): Promise<HoldingDto[]> {
  const response = await apiFetch('/portfolios/holdings');
  if (!response.ok) {
    throw new Error('Failed to fetch holdings');
  }
  return response.json();
}
