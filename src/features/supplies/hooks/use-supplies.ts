import { useQuery } from '@tanstack/react-query';
import { fetchSupplies, fetchSupplyDetails } from '../api/client';
import type { SuppliesQueryParams } from '../types';

export function useSuppliesQuery(params: SuppliesQueryParams) {
  return useQuery({
    queryKey: ['admin', 'supplies', params.fromTime, params.toTime, params.first, params.pageSize],
    queryFn: () => fetchSupplies(params),
    staleTime: 1000 * 60 * 2, // 2 minutes
    placeholderData: (previousData) => previousData,
  });
}

export function useSupplyDetailsQuery(id: number | null) {
  return useQuery({
    queryKey: ['admin', 'supply', id],
    queryFn: () => fetchSupplyDetails(id!),
    enabled: typeof id === 'number' && id > 0,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}
