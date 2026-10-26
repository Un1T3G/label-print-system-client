export interface UmagSupplySummaryItem {
  id: number;
  type: number;
  docTime: number; // millisecond timestamp
  editTime: number;
  paymentType: number;
  amount: number;
  comment: string | null;
  arrivalCost: number;
  sellingCost: number;
  paymentAmount: number;
  paymentRefundAmount: number;
  account: string | null;
  debt: number;
  supplierId: number;
  userId: number;
  userFirstName: string;
  supplierName: string;
  supplierLegalName: string;
  isOcr?: boolean;
}

export interface UmagSuppliesListResponse {
  fetchedCount: number;
  totalCount: number;
  amount: number;
  paymentAmount: number;
  paymentRefundAmount: number;
  arrivalCost: number;
  sellingCost: number;
  debt: number;
  startTime: number;
  endTime: number;
  list: UmagSupplySummaryItem[];
}

export interface UmagSupplyProductItem {
  id: number;
  storeId: number;
  barcode: number | string;
  quantity: number;
  price: number;
  arrivalCost: number;
  sellingPrice: number;
  type?: number;
  draftName?: string;
  product?: {
    id: number;
    code?: string;
    barcode?: number | string;
    name: string;
    fullName?: string | null;
    type?: number;
    measure?: number;
  };
  productDetail?: {
    arrivalCost?: number;
    sellingPrice?: number;
    wholesalePrice?: number;
    stockQuantity?: number;
  };
}

export interface UmagSupplyDetails {
  id: number;
  supplierId: number;
  amount: number;
  comment: string | null;
  time: string; // ISO string e.g. "2026-10-24T16:50:51+0500"
  type?: number;
  paymentType?: number;
  supplierName: string;
  supplier?: string;
  user?: string;
  account?: string | null;
  payment?: number;
  debt?: number | null;
  paidAmount?: number;
  sellingAmount?: number;
  arrivalAmount?: number;
  supplyProducts: UmagSupplyProductItem[];
  bonusProducts?: unknown[];
}

export interface SuppliesQueryParams {
  first?: number;
  pageSize?: number;
  fromTime: number; // ms
  toTime: number; // ms
}
