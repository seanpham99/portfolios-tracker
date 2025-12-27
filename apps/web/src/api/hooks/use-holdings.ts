import { useQuery } from '@tanstack/react-query';
import { apiFetch } from '../client';
import { HoldingDto as Holding } from '@repo/api-types';


export const useHoldings = () => {
  return useQuery({
    queryKey: ['holdings'],
    queryFn: async () => {
      const response = await apiFetch('/portfolios/holdings');
      if (!response.ok) {
        throw new Error('Failed to fetch holdings');
      }
      return response.json() as Promise<Holding[]>;
    },
    refetchInterval: 60000,
  });
};
