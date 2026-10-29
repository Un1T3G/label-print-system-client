export interface UmagProductSearchPayload {
  first: number;
  pageSize: number;
  measure?: 0 | 1;
  fullSearchCriteria?: string;
}

export interface UmagProduct {
  id: number;
  barcode: number;
  name: string;
  fullName: string;
  type: 0 | 1;
  measureName: string;
  arrivalCost: number;
  sellingPrice: number;
  wholesalePrice: number;
  aliasList: string[];
}

export interface UmagSearchResponse {
  totalCount: number;
  fetchedCount: number;
  content: UmagProduct[];
}

export interface PrintJobItem {
  barcode: string;
  name: string;
  price: number;
  measureName: string;
  quantity: number;
  /** PLU-код весового товара (aliasList[0]) */
  plu?: string;
  /** Список алиасов товара (первый элемент — PLU код для весовых товаров) */
  aliasList?: string[];
  /** true если товар весовой (type === 1) */
  isWeight?: boolean;
}

export interface PrintJobPayload {
  template: unknown;
  items: PrintJobItem[];
}

