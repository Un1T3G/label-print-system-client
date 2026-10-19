export type LabelElementType =
  | 'storeName'      // Название магазина / шапка
  | 'productName'    // Название товара
  | 'price'          // Основная цена и валюта
  | 'oldPrice'       // Старая цена (зачеркнутая)
  | 'discountBadge'  // Бейдж скидки / акции ("-20%", "АКЦИЯ", "ХИТ")
  | 'barcode'        // Штрихкод (CODE128, EAN-13)
  | 'qrcode'         // QR-код (для ссылок, оплаты, проверки)
  | 'date'           // Дата печати / фасовки
  | 'productCode'    // Артикул / код товара
  | 'country'        // Страна производства / происхождение
  | 'divider'        // Горизонтальная линия-разделитель
  | 'customText';    // Произвольный текст / подвал / слоган

export interface LabelElement {
  id: string;
  type: LabelElementType;
  label: string;
  visible: boolean;
  order: number;

  offsetX?: number;
  offsetY?: number;

  content?: string;
  prefix?: string;
  suffix?: string;
  fontSize?: number;
  fontWeight?: 'normal' | 'medium' | 'semibold' | 'bold' | 'black';
  fontStyle?: 'normal' | 'italic';
  textAlign?: 'left' | 'center' | 'right';
  textTransform?: 'none' | 'uppercase' | 'capitalize';
  lineClamp?: number;

  inverted?: boolean;
  borderBottom?: boolean;
  borderWidth?: number;
  paddingY?: number;

  barcodeType?: '128' | 'EAN13';
  barcodeHeight?: number;
  showBarcodeDigits?: boolean;
  qrSize?: number;
  qrData?: string;

  showMeasure?: boolean;
  currencySymbol?: string;
  oldPriceValue?: number;
}

export interface PrintTemplateConfig {
  elements?: LabelElement[];

  showStoreName?: boolean;
  storeNameText?: string;
  storeNameAlign?: 'left' | 'center';

  titleFontSize?: number;
  priceFontSize?: number;
  currencySymbol?: string;
  textAlign?: 'left' | 'center';
  showMeasure?: boolean;

  showBarcode?: boolean;
  barcodeType?: '128' | 'EAN13';
  barcodeHeight?: number;
  showBarcodeDigits?: boolean;

  showDate?: boolean;
  datePosition?: 'header' | 'footer';
  showFooter?: boolean;
  footerText?: string;

  showBorder?: boolean;
  borderWidth?: number;

  density?: number;
  speed?: number;
  gapMm?: number;
  direction?: 0 | 1;

  nameOffsetY?: number;
  priceOffsetY?: number;
  barcodeOffsetY?: number;
}

export interface PrintTemplate {
  id: string;
  name: string;
  widthMm: number;
  heightMm: number;
  isDefault: boolean;
  config: PrintTemplateConfig;
  createdAt: string;
  updatedAt: string;
}

export type CreatePrintTemplateDto = Omit<PrintTemplate, 'id' | 'createdAt' | 'updatedAt'>;
export type UpdatePrintTemplateDto = Partial<CreatePrintTemplateDto>;
