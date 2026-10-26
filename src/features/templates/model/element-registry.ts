import type { ElementDefinition } from './element-registry-types';
import type { LabelElementType } from '../types';
import {
  Tag,
  Type,
  Percent,
  Sparkles,
  Barcode,
  QrCode,
  Globe,
  Split,
  Calendar,
  Scale,
} from 'lucide-react';
import {
  StoreNamePreview,
  ProductNamePreview,
  PricePreview,
  OldPricePreview,
  DiscountBadgePreview,
  BarcodePreview,
  PluCodePreview,
  QrCodePreview,
  ProductCodePreview,
  CountryPreview,
  DatePreview,
  DividerPreview,
  CustomTextPreview,
} from '../components/preview/renderers/element-renderers';

const REGISTRY: Record<LabelElementType, ElementDefinition> = {
  customText: {
    type: 'customText',
    label: 'Произвольный текст',
    description: 'Слоган, предупреждение, состав, срок годности или акция',
    icon: Type,
    defaultConfig: {
      content: '★ ВЫГОДНОЕ ПРЕДЛОЖЕНИЕ ★',
      fontSize: 8,
      fontWeight: 'bold',
      textAlign: 'center',
      textTransform: 'uppercase',
    },
    capabilities: {
      hasContent: true,
      contentPlaceholder: 'Текст',
      hasPrefixSuffix: true,
      hasTypography: true,
      hasStyleModifiers: true,
    },
    RenderPreview: CustomTextPreview,
  },
  oldPrice: {
    type: 'oldPrice',
    label: 'Старая цена (зачеркнутая)',
    description: 'Перечеркнутая прежняя цена для скидок и распродаж',
    icon: Percent,
    defaultConfig: {
      prefix: 'Старая: ',
      suffix: ' сум',
      fontSize: 11,
      fontWeight: 'normal',
      textAlign: 'left',
      oldPriceValue: 18500,
    },
    capabilities: {
      hasContent: false,
      hasPrefixSuffix: true,
      hasTypography: true,
      hasStyleModifiers: true,
    },
    RenderPreview: OldPricePreview,
  },
  discountBadge: {
    type: 'discountBadge',
    label: 'Бейдж скидки / акция',
    description: 'Контрастный бейдж (-20%, ХИТ, АКЦИЯ, СКИДКА, NEW)',
    icon: Sparkles,
    defaultConfig: {
      content: '-20% СКИДКА',
      fontSize: 9,
      fontWeight: 'black',
      textAlign: 'center',
      inverted: true,
      textTransform: 'uppercase',
      paddingY: 2,
    },
    capabilities: {
      hasContent: true,
      contentPlaceholder: '-20% СКИДКА',
      hasPrefixSuffix: false,
      hasTypography: true,
      hasStyleModifiers: true,
    },
    RenderPreview: DiscountBadgePreview,
  },
  qrcode: {
    type: 'qrcode',
    label: 'QR-код',
    description: 'Для ссылок, оплаты Kaspi / Payme, сайта или верификации',
    icon: QrCode,
    defaultConfig: {
      qrSize: 34,
      qrData: 'https://alpamisshop.uz/p/10452',
      textAlign: 'center',
    },
    capabilities: {
      hasContent: false,
      hasPrefixSuffix: false,
      hasTypography: false,
      hasStyleModifiers: false,
      hasQrSettings: true,
    },
    RenderPreview: QrCodePreview,
  },
  productCode: {
    type: 'productCode',
    label: 'Артикул / Код товара',
    description: 'Внутренний код товара в базе или артикул 1С/Umag',
    icon: Type,
    defaultConfig: {
      prefix: 'Арт: ',
      content: '10452',
      fontSize: 8,
      fontWeight: 'bold',
      textAlign: 'left',
    },
    capabilities: {
      hasContent: true,
      contentPlaceholder: '10452',
      hasPrefixSuffix: true,
      hasTypography: true,
      hasStyleModifiers: true,
    },
    RenderPreview: ProductCodePreview,
  },
  country: {
    type: 'country',
    label: 'Страна происхождения',
    description: 'Информация о производителе или стране выпуска',
    icon: Globe,
    defaultConfig: {
      prefix: 'Страна: ',
      content: 'Узбекистан',
      fontSize: 8,
      fontWeight: 'normal',
      textAlign: 'left',
    },
    capabilities: {
      hasContent: true,
      contentPlaceholder: 'Страна',
      hasPrefixSuffix: true,
      hasTypography: true,
      hasStyleModifiers: true,
    },
    RenderPreview: CountryPreview,
  },
  divider: {
    type: 'divider',
    label: 'Линия-разделитель',
    description: 'Горизонтальная черта для разграничения блоков',
    icon: Split,
    defaultConfig: {
      borderWidth: 1,
      paddingY: 2,
    },
    capabilities: {
      hasContent: false,
      hasPrefixSuffix: false,
      hasTypography: false,
      hasStyleModifiers: false,
      hasDividerSettings: true,
    },
    RenderPreview: DividerPreview,
  },
  storeName: {
    type: 'storeName',
    label: 'Название магазина / Шапка',
    description: 'Заголовок с брендом (ALPAMIS, Супермаркет)',
    icon: Tag,
    defaultConfig: {
      content: 'ALPAMIS',
      fontSize: 9,
      fontWeight: 'black',
      textAlign: 'center',
      textTransform: 'uppercase',
    },
    capabilities: {
      hasContent: true,
      contentPlaceholder: 'ALPAMIS',
      hasPrefixSuffix: false,
      hasTypography: true,
      hasStyleModifiers: true,
    },
    RenderPreview: StoreNamePreview,
  },
  productName: {
    type: 'productName',
    label: 'Название товара',
    description: 'Основное наименование из базы (крупный шрифт)',
    icon: Type,
    defaultConfig: {
      fontSize: 11,
      fontWeight: 'bold',
      textAlign: 'left',
      lineClamp: 2,
    },
    capabilities: {
      hasContent: true,
      contentPlaceholder: 'Из базы товара',
      hasPrefixSuffix: false,
      hasTypography: true,
      hasStyleModifiers: true,
    },
    RenderPreview: ProductNamePreview,
  },
  price: {
    type: 'price',
    label: 'Основная цена',
    description: 'Крупная цена товара и валюта (сум, тг, руб)',
    icon: Percent,
    defaultConfig: {
      fontSize: 22,
      fontWeight: 'black',
      textAlign: 'left',
      currencySymbol: 'сум',
      showMeasure: true,
    },
    capabilities: {
      hasContent: false,
      hasPrefixSuffix: false,
      hasTypography: true,
      hasStyleModifiers: true,
      hasPriceSettings: true,
    },
    RenderPreview: PricePreview,
  },
  barcode: {
    type: 'barcode',
    label: 'Штрихкод (EAN-13 / CODE128)',
    description: 'Штриховой код для кассовых сканеров',
    icon: Barcode,
    defaultConfig: {
      barcodeType: '128',
      barcodeHeight: 42,
      showBarcodeDigits: true,
      barcodeHideOnWeight: false,
      barcodeWidth: 2,
      textAlign: 'center',
    },
    capabilities: {
      hasContent: false,
      hasPrefixSuffix: false,
      hasTypography: false,
      hasStyleModifiers: false,
      hasBarcodeSettings: true,
    },
    RenderPreview: BarcodePreview,
  },
  pluCode: {
    type: 'pluCode',
    label: 'PLU-код (Весовой товар)',
    description: 'Крупный цифровой код для электронных весов',
    icon: Scale,
    defaultConfig: {
      pluStyle: 'box',
      pluLabel: 'PLU КОД',
      pluLabelPosition: 'top',
      fontSize: 14,
      fontWeight: 'black',
      textAlign: 'center',
      showOnlyForWeight: true,
      letterSpacing: 'wide',
    },
    capabilities: {
      hasContent: false,
      hasPrefixSuffix: false,
      hasTypography: true,
      hasStyleModifiers: false,
      hasPluSettings: true,
    },
    RenderPreview: PluCodePreview,
  },
  date: {
    type: 'date',
    label: 'Дата печати / фасовки',
    description: 'Автоматическая текущая дата печати',
    icon: Calendar,
    defaultConfig: {
      prefix: 'Дата: ',
      fontSize: 7.5,
      fontWeight: 'normal',
      textAlign: 'right',
    },
    capabilities: {
      hasContent: false,
      hasPrefixSuffix: true,
      hasTypography: true,
      hasStyleModifiers: true,
    },
    RenderPreview: DatePreview,
  },
};

/**
 * Получить определение элемента из реестра по его типу.
 * При отсутствии возвращает fallback для customText.
 */
export function getElementDefinition(type: LabelElementType): ElementDefinition {
  return REGISTRY[type] || REGISTRY.customText;
}

/**
 * Получить список всех зарегистрированных определений элементов
 */
export function getAllElementDefinitions(): ElementDefinition[] {
  return Object.values(REGISTRY);
}

/**
 * Зарегистрировать или переопределить определение элемента (OCP)
 */
export function registerElementDefinition(definition: ElementDefinition): void {
  REGISTRY[definition.type] = definition;
}
