import { apiFetch } from '@/shared/api';
import type {
  UmagSuppliesListResponse,
  UmagSupplyDetails,
  SuppliesQueryParams,
} from '../types';

export async function fetchSupplies(
  params: SuppliesQueryParams
): Promise<UmagSuppliesListResponse> {
  const query = new URLSearchParams({
    first: String(params.first ?? 0),
    pageSize: String(params.pageSize ?? 50),
    fromTime: String(params.fromTime),
    toTime: String(params.toTime),
  });

  return apiFetch<UmagSuppliesListResponse>(`/api/admin/supplies?${query.toString()}`);
}

export async function fetchSupplyDetails(id: number): Promise<UmagSupplyDetails> {
  return apiFetch<UmagSupplyDetails>(`/api/admin/supplies/${id}`);
}
