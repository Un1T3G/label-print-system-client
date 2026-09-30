// Umag API Types
export interface UmagProductSearchPayload {
  first: number;                   // Смещение (0, 10, 20...)
  pageSize: number;                // Размер страницы
  measure?: 0 | 1;                 // 0 = шт, 1 = кг, undefined = все
  fullSearchCriteria?: string;     // Текст поиска (undefined если не указан)
}

export interface UmagProduct {
  id: number;                      // ID товара
  barcode: number;                 // Основной штрихкод
  name: string;                    // Название товара
  fullName: string;
  type: 0 | 1;                     // 0 = шт, 1 = кг
  measureName: string;             // "шт." || "кг."
  arrivalCost: number;             // Закупочная цена
  sellingPrice: number;            // Закупочная цена (по спецификации Umag)
  wholesalePrice: number;          // ПРОДАЖНАЯ ЦЕНА (выводить консультанту и на ценник)
  aliasList: string[];             // Дополнительные штрихкоды
}

export interface UmagSearchResponse {
  totalCount: number;
  fetchedCount: number;
  content: UmagProduct[];
}

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
  label: string;                  // Название слоя (напр. "Название товара", "Штрихкод")
  visible: boolean;               // Видимость элемента (hide/show)
  order: number;                  // Порядковый номер в стеке

  // Позиционирование и смещение
  offsetX?: number;               // Смещение по горизонтали X (px)
  offsetY?: number;               // Смещение по вертикали Y (px)

  // Текст и содержимое
  content?: string;               // Кастомный текст для customText, storeName, discount, country и т.д.
  prefix?: string;                // Префикс (напр. "Арт: ", "Старая: ")
  suffix?: string;                // Суффикс (напр. " сум", " шт.")
  fontSize?: number;              // Размер шрифта (pt)
  fontWeight?: 'normal' | 'medium' | 'semibold' | 'bold' | 'black';
  fontStyle?: 'normal' | 'italic';
  textAlign?: 'left' | 'center' | 'right';
  textTransform?: 'none' | 'uppercase' | 'capitalize';
  lineClamp?: number;             // Ограничение строк (1, 2, 3 или 0 без ограничений)

  // Оформление блока
  inverted?: boolean;             // Инверсия (белый текст на черном фоне)
  borderBottom?: boolean;         // Линия подчеркивания снизу
  borderWidth?: number;           // Толщина разделителя или рамки (px)
  paddingY?: number;              // Вертикальный отступ (px)

  // Свойства штрихкода и QR
  barcodeType?: '128' | 'EAN13';  // Формат штрихкода
  barcodeHeight?: number;         // Высота полос (pt)
  showBarcodeDigits?: boolean;    // Выводить цифры под штрихкодом
  qrSize?: number;                // Размер QR (px)
  qrData?: string;                // Данные для QR-кода

  // Свойства цены
  showMeasure?: boolean;          // Выводить единицу (за шт. / за кг.)
  currencySymbol?: string;        // Валюта (сум, ₸, руб.)
  oldPriceValue?: number;         // Значение старой цены для oldPrice
}

// Print Templates Types
export interface PrintTemplateConfig {
  // Расширенная система элементов (полная кастомизация)
  elements?: LabelElement[];

  // Заголовок магазина (обратная совместимость)
  showStoreName?: boolean;        // Показывать название магазина
  storeNameText?: string;        // Текст заголовка (напр. "Alpamis")
  storeNameAlign?: 'left' | 'center'; // Выравнивание шапки

  // Товар и цена (обратная совместимость)
  titleFontSize?: number;         // Размер шрифта названия (в pt/px)
  priceFontSize?: number;         // Размер шрифта цены (в pt/px)
  currencySymbol?: string;        // Символ валюты ("₸", "сум", "руб.")
  textAlign?: 'left' | 'center'; // Выравнивание текста и цены
  showMeasure?: boolean;          // Выводить единицу измерения (шт/кг)

  // Штрихкод (обратная совместимость)
  showBarcode?: boolean;          // Выводить штрихкод
  barcodeType?: '128' | 'EAN13'; // Тип штрихкода (CODE128 или EAN-13)
  barcodeHeight?: number;        // Высота полос штрихкода (в pt/px)
  showBarcodeDigits?: boolean;   // Выводить цифры под штрихкодом

  // Дата и подвал (обратная совместимость)
  showDate?: boolean;             // Выводить дату печати
  datePosition?: 'header' | 'footer'; // Расположение даты
  showFooter?: boolean;          // Показывать нижний текст
  footerText?: string;           // Текст в подвале (напр. "Спасибо за покупку!")

  // Оформление
  showBorder?: boolean;          // Рамка по периметру ценника
  borderWidth?: number;          // Толщина рамки (1-3)

  // Параметры TSPL принтера
  density?: number;              // Плотность/яркость термоголовки (1-15, обычно 8-12)
  speed?: number;                // Скорость печати (2-6 дюйм/сек)
  gapMm?: number;                // Зазор между этикетками (обычно 2 мм)
  direction?: 0 | 1;             // Направление печати (0 = прямо, 1 = 180°)

  // Тонкая подстройка смещения (мм / точки)
  nameOffsetY?: number;          // Смещение названия по вертикали
  priceOffsetY?: number;         // Смещение цены по вертикали
  barcodeOffsetY?: number;       // Смещение штрихкода по вертикали
}

export interface PrintTemplate {
  id: string;                    // Уникальный ID шаблона
  name: string;                  // Название (напр. "Стандартный 58х40мм")
  widthMm: number;               // Ширина ценника в мм
  heightMm: number;              // Высота ценника в мм
  isDefault: boolean;            // Шаблон по умолчанию
  config: PrintTemplateConfig;
  createdAt: string;
  updatedAt: string;
}

export type CreatePrintTemplateDto = Omit<PrintTemplate, 'id' | 'createdAt' | 'updatedAt'>;

// Print Job Payload
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

// Session & Auth Types
export type UserRole = 'CONSULTANT' | 'ADMIN';

export interface SessionUser {
  id: string;
  login: string;
  name: string;
  role: UserRole;
}
