import { type PortfolioSummaryDto, type HoldingDto, type AssetDetailsResponseDto } from '@repo/api-types';
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

/**
 * Fetch detailed asset performance and history
 */
export async function getAssetDetails(portfolioId: string, symbol: string): Promise<AssetDetailsResponseDto> {
  const response = await apiFetch(`/portfolios/${portfolioId}/assets/${symbol}/details`);
  if (!response.ok) {
    throw new Error(`Failed to fetch asset details for ${symbol}`);
  }
  return response.json();
}
/**
 * Search for assets by symbol or name
 */
export async function searchAssets(query: string): Promise<any[]> {
  const response = await apiFetch(`/assets/search?q=${encodeURIComponent(query)}`);
  if (!response.ok) {
    throw new Error('Failed to search assets');
  }
  return response.json();
}

/**
 * Add a transaction to a portfolio
 */
export async function addTransaction(portfolioId: string, transaction: any): Promise<any> {
  const response = await apiFetch(`/portfolios/${portfolioId}/transactions`, {
    method: 'POST',
    body: JSON.stringify(transaction),
  });
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Failed to add transaction');
  }
  return response.json();
}
