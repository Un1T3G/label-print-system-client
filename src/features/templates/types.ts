export type LabelElementType =
  | 'storeName'      // Название магазина / шапка
  | 'productName'    // Название товара
  | 'price'          // Основная цена и валюта
  | 'oldPrice'       // Старая цена (зачеркнутая)
  | 'discountBadge'  // Бейдж скидки / акции ("-20%", "АКЦИЯ", "ХИТ")
  | 'barcode'        // Штрихкод (CODE128, EAN-13)
  | 'pluCode'        // PLU-код для весовых товаров (крупный номер весов)
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

  // Настройки штрихкода:
  barcodeType?: '128' | 'EAN13';
  barcodeHeight?: number;
  showBarcodeDigits?: boolean;
  barcodeHideOnWeight?: boolean; // скрывать штрихкод для весовых товаров
  barcodeWidth?: number;         // модуль ширины (1, 2, 3)

  // Настройки PLU-кода (весовой товар):
  pluStyle?: 'box' | 'badge' | 'plain' | 'underline'; // стиль рамки
  pluLabel?: string;                                 // подпись ("PLU КОД", "PLU:", "Код весов")
  pluLabelPosition?: 'top' | 'inline' | 'none';       // расположение подписи
  showOnlyForWeight?: boolean;                       // показывать только если товар весовой
  letterSpacing?: 'normal' | 'wide' | 'widest';      // межзнаковый интервал

  qrSize?: number;
  qrData?: string;

  showMeasure?: boolean;
  currencySymbol?: string;
  oldPriceValue?: number;
}

export type TemplateTargetType = 'piece' | 'weight' | 'all';
export type TemplateViewMode = 'piece' | 'weight';

export interface PrintTemplateConfig {
  /** Общие / резервные элементы ценника */
  elements?: LabelElement[];
  /** Макет элементов для штучных товаров (шт) со штрихкодом */
  pieceElements?: LabelElement[];
  /** Макет элементов для весовых товаров (кг) с PLU-кодом весов */
  weightElements?: LabelElement[];

  /** Назначение шаблона: штучные товары (шт), весовые (кг) или универсальный (оба вида) */
  targetType?: TemplateTargetType;
  /** Является ли основным шаблоном для штучных товаров */
  isDefaultPiece?: boolean;
  /** Является ли основным шаблоном для весовых товаров */
  isDefaultWeight?: boolean;

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

  paddingX?: number;
  paddingY?: number;

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
