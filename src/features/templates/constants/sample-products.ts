export interface SampleProduct {
  name: string;
  price: number;
  barcode: string;
  measureName: string;
  code?: string;
  country?: string;
}

export const SAMPLE_PRODUCTS: SampleProduct[] = [
  {
    name: 'Черноголовка Тархун 1.5л (T)',
    price: 12000,
    barcode: '4780111550194',
    measureName: 'шт.',
    code: '10452',
    country: 'Россия',
  },
  {
    name: 'Шоколад «Казахстан» темный классический 100г Рахат',
    price: 15500,
    barcode: '4870002010123',
    measureName: 'шт.',
    code: '20891',
    country: 'Казахстан',
  },
  {
    name: 'Яблоки «Апорт» свежие отборные премиум',
    price: 8500,
    barcode: '2000000100452',
    measureName: 'кг.',
    code: '33104',
    country: 'Узбекистан',
  },
];
