import { useQuery } from '@tanstack/react-query';
import { apiFetch } from '@/shared/api';
import type { UmagSearchResponse, UmagProductSearchPayload } from '../types';

export function useProducts(params: UmagProductSearchPayload) {
  return useQuery({
    queryKey: ['products', params],
    queryFn: () =>
      apiFetch<UmagSearchResponse>('/api/products/search', {
        method: 'POST',
        body: JSON.stringify(params),
      }),
    staleTime: 1000 * 60 * 3, // 3 minutes
    placeholderData: (prev) => prev,
  });
}
