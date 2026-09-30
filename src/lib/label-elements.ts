import { LabelElement, LabelElementType, PrintTemplateConfig } from './types';

export const ELEMENT_PRESET_CATALOG: Array<{
  type: LabelElementType;
  label: string;
  description: string;
  defaultConfig: Partial<LabelElement>;
}> = [
  {
    type: 'customText',
    label: 'Произвольный текст',
    description: 'Слоган, предупреждение, состав, срок годности или акция',
    defaultConfig: {
      content: '★ ВЫГОДНОЕ ПРЕДЛОЖЕНИЕ ★',
      fontSize: 8,
      fontWeight: 'bold',
      textAlign: 'center',
      textTransform: 'uppercase',
    },
  },
  {
    type: 'oldPrice',
    label: 'Старая цена (зачеркнутая)',
    description: 'Перечеркнутая прежняя цена для скидок и распродаж',
    defaultConfig: {
      prefix: 'Старая: ',
      suffix: ' сум',
      fontSize: 11,
      fontWeight: 'normal',
      textAlign: 'left',
      oldPriceValue: 18500,
    },
  },
  {
    type: 'discountBadge',
    label: 'Бейдж скидки / акция',
    description: 'Контрастный бейдж (-20%, ХИТ, АКЦИЯ, СКИДКА, NEW)',
    defaultConfig: {
      content: '-20% СКИДКА',
      fontSize: 9,
      fontWeight: 'black',
      textAlign: 'center',
      inverted: true,
      textTransform: 'uppercase',
      paddingY: 2,
    },
  },
  {
    type: 'qrcode',
    label: 'QR-код',
    description: 'Для ссылок, оплаты Kaspi / Payme, сайта или верификации',
    defaultConfig: {
      qrSize: 34,
      qrData: 'https://alpamisshop.uz/p/10452',
      textAlign: 'center',
    },
  },
  {
    type: 'productCode',
    label: 'Артикул / Код товара',
    description: 'Внутренний код товара в базе или артикул 1С/Umag',
    defaultConfig: {
      prefix: 'Арт: ',
      content: '10452',
      fontSize: 8,
      fontWeight: 'bold',
      textAlign: 'left',
    },
  },
  {
    type: 'country',
    label: 'Страна происхождения',
    description: 'Информация о производителе или стране выпуска',
    defaultConfig: {
      prefix: 'Страна: ',
      content: 'Узбекистан',
      fontSize: 8,
      fontWeight: 'normal',
      textAlign: 'left',
    },
  },
  {
    type: 'divider',
    label: 'Линия-разделитель',
    description: 'Горизонтальная черта для разграничения блоков',
    defaultConfig: {
      borderWidth: 1,
      paddingY: 2,
    },
  },
  {
    type: 'storeName',
    label: 'Название магазина / Шапка',
    description: 'Заголовок с брендом (ALPAMIS, Супермаркет)',
    defaultConfig: {
      content: 'ALPAMIS',
      fontSize: 9,
      fontWeight: 'black',
      textAlign: 'center',
      textTransform: 'uppercase',
      borderBottom: true,
    },
  },
  {
    type: 'productName',
    label: 'Название товара',
    description: 'Полное наименование номенклатуры из каталога',
    defaultConfig: {
      fontSize: 11,
      fontWeight: 'bold',
      textAlign: 'left',
      lineClamp: 2,
    },
  },
  {
    type: 'price',
    label: 'Цена товара',
    description: 'Крупная продажная цена и символ валюты',
    defaultConfig: {
      fontSize: 24,
      fontWeight: 'black',
      textAlign: 'left',
      currencySymbol: 'сум',
      showMeasure: true,
      borderBottom: true,
    },
  },
  {
    type: 'barcode',
    label: 'Штрихкод',
    description: 'Линейный штрихкод CODE128 или EAN-13',
    defaultConfig: {
      barcodeType: '128',
      barcodeHeight: 45,
      showBarcodeDigits: true,
    },
  },
  {
    type: 'date',
    label: 'Дата печати / фасовки',
    description: 'Текущая дата и время изготовления ценника',
    defaultConfig: {
      prefix: 'Дата: ',
      fontSize: 8,
      fontWeight: 'normal',
      textAlign: 'right',
    },
  },
];

export function getDefaultElements(config?: Partial<PrintTemplateConfig>): LabelElement[] {
  let order = 0;
  return [
    {
      id: 'el-store-name',
      type: 'storeName',
      label: 'Название магазина',
      visible: config?.showStoreName !== false,
      order: order++,
      content: config?.storeNameText || 'ALPAMIS',
      fontSize: 9,
      fontWeight: 'black',
      textAlign: config?.storeNameAlign || 'center',
      textTransform: 'uppercase',
      borderBottom: true,
      offsetY: 0,
      offsetX: 0,
    },
    {
      id: 'el-product-name',
      type: 'productName',
      label: 'Название товара',
      visible: true,
      order: order++,
      fontSize: config?.titleFontSize || 11,
      fontWeight: 'bold',
      textAlign: config?.textAlign || 'left',
      lineClamp: 2,
      offsetY: config?.nameOffsetY || 0,
      offsetX: 0,
    },
    {
      id: 'el-price',
      type: 'price',
      label: 'Продажная цена',
      visible: true,
      order: order++,
      fontSize: config?.priceFontSize || 24,
      fontWeight: 'black',
      textAlign: config?.textAlign || 'left',
      currencySymbol: config?.currencySymbol || 'сум',
      showMeasure: config?.showMeasure !== false,
      borderBottom: true,
      offsetY: config?.priceOffsetY || 0,
      offsetX: 0,
    },
    {
      id: 'el-barcode',
      type: 'barcode',
      label: 'Штрихкод',
      visible: config?.showBarcode !== false,
      order: order++,
      barcodeType: config?.barcodeType || '128',
      barcodeHeight: config?.barcodeHeight || 45,
      showBarcodeDigits: config?.showBarcodeDigits !== false,
      offsetY: config?.barcodeOffsetY || 0,
      offsetX: 0,
    },
    {
      id: 'el-date',
      type: 'date',
      label: 'Дата печати',
      visible: config?.showDate !== false,
      order: order++,
      prefix: '',
      fontSize: 8,
      fontWeight: 'normal',
      textAlign: config?.datePosition === 'footer' ? 'right' : 'right',
      offsetY: 0,
      offsetX: 0,
    },
    {
      id: 'el-footer',
      type: 'customText',
      label: 'Подвал / Слоган',
      visible: config?.showFooter || false,
      order: order++,
      content: config?.footerText || '★ ГАРАНТИЯ КАЧЕСТВА ★',
      fontSize: 8,
      fontWeight: 'bold',
      textAlign: 'center',
      textTransform: 'uppercase',
      offsetY: 0,
      offsetX: 0,
    },
  ];
}

/**
 * Returns active elements sorted by order, migrating legacy config if elements array is missing.
 */
export function getTemplateElements(config?: Partial<PrintTemplateConfig>): LabelElement[] {
  if (config?.elements && Array.isArray(config.elements) && config.elements.length > 0) {
    return [...config.elements].sort((a, b) => a.order - b.order);
  }
  return getDefaultElements(config);
}

/**
 * Syncs the elements array back into the config while keeping legacy keys consistent
 */
export function syncConfigWithElements(
  elements: LabelElement[],
  prevConfig: PrintTemplateConfig
): PrintTemplateConfig {
  const storeEl = elements.find((e) => e.type === 'storeName');
  const prodEl = elements.find((e) => e.type === 'productName');
  const priceEl = elements.find((e) => e.type === 'price');
  const barEl = elements.find((e) => e.type === 'barcode');
  const dateEl = elements.find((e) => e.type === 'date');
  const footerEl = elements.find((e) => e.type === 'customText' && e.id === 'el-footer') ||
    elements.find((e) => e.type === 'customText');

  return {
    ...prevConfig,
    elements,
    showStoreName: storeEl ? storeEl.visible : prevConfig.showStoreName,
    storeNameText: storeEl?.content ?? prevConfig.storeNameText,
    storeNameAlign: (storeEl?.textAlign as 'left' | 'center') ?? prevConfig.storeNameAlign,
    titleFontSize: prodEl?.fontSize ?? prevConfig.titleFontSize,
    textAlign: (prodEl?.textAlign as 'left' | 'center') ?? prevConfig.textAlign,
    nameOffsetY: prodEl?.offsetY ?? prevConfig.nameOffsetY,
    priceFontSize: priceEl?.fontSize ?? prevConfig.priceFontSize,
    currencySymbol: priceEl?.currencySymbol ?? prevConfig.currencySymbol,
    showMeasure: priceEl ? priceEl.showMeasure !== false : prevConfig.showMeasure,
    priceOffsetY: priceEl?.offsetY ?? prevConfig.priceOffsetY,
    showBarcode: barEl ? barEl.visible : prevConfig.showBarcode,
    barcodeType: barEl?.barcodeType ?? prevConfig.barcodeType,
    barcodeHeight: barEl?.barcodeHeight ?? prevConfig.barcodeHeight,
    showBarcodeDigits: barEl ? barEl.showBarcodeDigits !== false : prevConfig.showBarcodeDigits,
    barcodeOffsetY: barEl?.offsetY ?? prevConfig.barcodeOffsetY,
    showDate: dateEl ? dateEl.visible : prevConfig.showDate,
    showFooter: footerEl ? footerEl.visible : prevConfig.showFooter,
    footerText: footerEl?.content ?? prevConfig.footerText,
  };
}

export interface LayoutPreset {
  id: string;
  name: string;
  description: string;
  icon: string;
  elements: (baseConfig?: Partial<PrintTemplateConfig>) => LabelElement[];
}

export const LAYOUT_PRESETS: LayoutPreset[] = [
  {
    id: 'standard',
    name: 'Стандартный (58х40)',
    description: 'Шапка магазина, название товара, крупная цена, штрихкод',
    icon: 'Standard',
    elements: (cfg) => getDefaultElements(cfg),
  },
  {
    id: 'promo-discount',
    name: 'Акция со скидкой',
    description: 'Бейдж «АКЦИЯ», зачеркнутая старая цена, новая спеццена и штрихкод',
    icon: 'Sparkles',
    elements: () => [
      {
        id: `el-store-${Date.now()}`,
        type: 'storeName',
        label: 'Шапка магазина',
        visible: true,
        order: 0,
        content: 'СУПЕРМАРКЕТ ALPAMIS',
        fontSize: 8,
        fontWeight: 'black',
        textAlign: 'center',
        textTransform: 'uppercase',
        borderBottom: true,
      },
      {
        id: `el-badge-${Date.now()}`,
        type: 'discountBadge',
        label: 'Бейдж акции',
        visible: true,
        order: 1,
        content: '★ СУПЕРЦЕНА -25% ★',
        fontSize: 9,
        fontWeight: 'black',
        textAlign: 'center',
        inverted: true,
        textTransform: 'uppercase',
      },
      {
        id: `el-prod-${Date.now()}`,
        type: 'productName',
        label: 'Название товара',
        visible: true,
        order: 2,
        fontSize: 11,
        fontWeight: 'bold',
        textAlign: 'left',
        lineClamp: 2,
      },
      {
        id: `el-oldprice-${Date.now()}`,
        type: 'oldPrice',
        label: 'Старая цена',
        visible: true,
        order: 3,
        prefix: 'Обычная цена: ',
        suffix: ' сум',
        fontSize: 10,
        fontWeight: 'normal',
        textAlign: 'left',
        oldPriceValue: 18000,
      },
      {
        id: `el-price-${Date.now()}`,
        type: 'price',
        label: 'Акционная цена',
        visible: true,
        order: 4,
        fontSize: 26,
        fontWeight: 'black',
        textAlign: 'left',
        currencySymbol: 'сум',
        showMeasure: true,
        borderBottom: true,
      },
      {
        id: `el-barcode-${Date.now()}`,
        type: 'barcode',
        label: 'Штрихкод',
        visible: true,
        order: 5,
        barcodeType: '128',
        barcodeHeight: 38,
        showBarcodeDigits: true,
      },
    ],
  },
  {
    id: 'with-qr',
    name: 'С QR-кодом',
    description: 'Название, цена, QR-код для оплаты или ссылки, штрихкод',
    icon: 'QrCode',
    elements: () => [
      {
        id: `el-store-${Date.now()}`,
        type: 'storeName',
        label: 'Шапка магазина',
        visible: true,
        order: 0,
        content: 'ALPAMIS SMART RETAIL',
        fontSize: 9,
        fontWeight: 'bold',
        textAlign: 'center',
        borderBottom: true,
      },
      {
        id: `el-prod-${Date.now()}`,
        type: 'productName',
        label: 'Название товара',
        visible: true,
        order: 1,
        fontSize: 11,
        fontWeight: 'bold',
        textAlign: 'left',
        lineClamp: 2,
      },
      {
        id: `el-price-${Date.now()}`,
        type: 'price',
        label: 'Цена товара',
        visible: true,
        order: 2,
        fontSize: 22,
        fontWeight: 'black',
        textAlign: 'left',
        currencySymbol: 'сум',
        showMeasure: true,
      },
      {
        id: `el-qr-${Date.now()}`,
        type: 'qrcode',
        label: 'QR-код оплаты / информации',
        visible: true,
        order: 3,
        qrSize: 36,
        qrData: 'https://alpamisshop.uz/pay',
        textAlign: 'center',
      },
      {
        id: `el-barcode-${Date.now()}`,
        type: 'barcode',
        label: 'Штрихкод',
        visible: true,
        order: 4,
        barcodeType: '128',
        barcodeHeight: 32,
        showBarcodeDigits: true,
      },
    ],
  },
  {
    id: 'minimal-barcode',
    name: 'Минималистичный (Компакт)',
    description: 'Максимально крупная цена и штрихкод без лишних деталей',
    icon: 'Minimize2',
    elements: () => [
      {
        id: `el-prod-${Date.now()}`,
        type: 'productName',
        label: 'Название товара',
        visible: true,
        order: 0,
        fontSize: 10,
        fontWeight: 'bold',
        textAlign: 'center',
        lineClamp: 2,
      },
      {
        id: `el-price-${Date.now()}`,
        type: 'price',
        label: 'Цена товара',
        visible: true,
        order: 1,
        fontSize: 26,
        fontWeight: 'black',
        textAlign: 'center',
        currencySymbol: 'сум',
        showMeasure: true,
      },
      {
        id: `el-barcode-${Date.now()}`,
        type: 'barcode',
        label: 'Штрихкод',
        visible: true,
        order: 2,
        barcodeType: '128',
        barcodeHeight: 40,
        showBarcodeDigits: true,
      },
    ],
  },
];
