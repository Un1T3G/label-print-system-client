import { useInfiniteQuery } from '@tanstack/react-query';
import { apiFetch } from '@/shared/api';
import type { UmagSearchResponse } from '../types';

interface UseProductsInfiniteParams {
  search?: string;
  measure?: 0 | 1 | undefined;
  pageSize?: number;
}

export function useProductsInfinite({
  search,
  measure,
  pageSize = 24,
}: UseProductsInfiniteParams) {
  return useInfiniteQuery({
    queryKey: ['products-infinite', search, measure, pageSize],
    queryFn: ({ pageParam = 0 }) =>
      apiFetch<UmagSearchResponse>('/api/products/search', {
        method: 'POST',
        body: JSON.stringify({
          first: pageParam,
          pageSize,
          fullSearchCriteria: search || undefined,
          measure,
        }),
      }),
    initialPageParam: 0,
    getNextPageParam: (lastPage, allPages) => {
      const loaded = allPages.reduce((sum, p) => sum + p.content.length, 0);
      if (loaded >= lastPage.totalCount) return undefined;
      return loaded;
    },
    staleTime: 1000 * 60 * 3,
  });
}
