import { useQuery } from '@tanstack/react-query';
import { getPortfolios, getPortfolio } from '../client';

export const usePortfolios = () => {
  return useQuery({
    queryKey: ['portfolios'],
    queryFn: getPortfolios,
    staleTime: 30 * 1000, // 30s - matches backend cache TTL
    gcTime: 5 * 60 * 1000, // 5 min garbage collection
  });
};

export const usePortfolio = (id: string) => {
  return useQuery({
    queryKey: ['portfolio', id],
    queryFn: () => getPortfolio(id),
    enabled: !!id,
    staleTime: 30 * 1000,
    gcTime: 5 * 60 * 1000,
  });
};
