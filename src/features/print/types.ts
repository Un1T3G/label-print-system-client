import type { PrintTemplate } from '@/features/templates';

export interface PrintJobItem {
  barcode: string;
  name: string;
  price: number;
  measureName: string;
  quantity: number;
  /** PLU-код весового товара (aliasList[0] из Umag) */
  plu?: string;
  /** true если товар весовой (type === 1) */
  isWeight?: boolean;
}

export interface PrintJobPayload {
  template: PrintTemplate;
  items: PrintJobItem[];
}

export interface PrinterStatus {
  status: string;
  version: string;
  activePrinter: string;
  hasLastJob: boolean;
}
