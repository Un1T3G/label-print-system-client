export interface SampleProduct {
  name: string;
  price: number;
  barcode: string;
  measureName: string;
  code?: string;
  country?: string;
  /** PLU-код для весовых товаров */
  plu?: string;
  /** true если товар весовой */
  isWeight?: boolean;
}

export const SAMPLE_PRODUCTS: SampleProduct[] = [
  {
    name: 'Черноголовка Тархун 1.5л (T)',
    price: 12000,
    barcode: '4780111550194',
    measureName: 'шт.',
    code: '10452',
    country: 'Россия',
    isWeight: false,
  },
  {
    name: 'Шоколад «Казахстан» темный классический 100г',
    price: 15500,
    barcode: '4870002010123',
    measureName: 'шт.',
    code: '20891',
    country: 'Казахстан',
    isWeight: false,
  },
  {
    name: 'Яблоки «Апорт» свежие отборные премиум',
    price: 8500,
    barcode: '2000000100452',
    measureName: 'кг.',
    code: '33104',
    country: 'Узбекистан',
    plu: '452',
    isWeight: true,
  },
  {
    name: 'Бананы «Эквадор» сладкие экстра',
    price: 19500,
    barcode: '2000000100108',
    measureName: 'кг.',
    code: '33110',
    country: 'Эквадор',
    plu: '108',
    isWeight: true,
  },
];
