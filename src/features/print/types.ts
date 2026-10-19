import type { PrintTemplate } from '@/features/templates';

export interface PrintJobItem {
  barcode: string;
  name: string;
  price: number;
  measureName: string;
  quantity: number;
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
