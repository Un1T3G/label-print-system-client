'use client';

import React, { useState } from 'react';
import { useProducts } from '@/hooks/useProducts';
import { useDebounce } from '@/hooks/useDebounce';
import { usePrintCart } from '@/context/print-cart-context';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import {
  Search,
  Plus,
  Barcode,
  Layers,
  Check,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  AlertCircle,
  Package,
} from 'lucide-react';
import { UmagProduct } from '@/lib/types';

export default function ProductsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [measureFilter, setMeasureFilter] = useState<0 | 1 | undefined>(undefined);
  const [page, setPage] = useState(0);
  const pageSize = 20;

  const debouncedSearch = useDebounce(searchTerm, 300);
  const { addItem, items: cartItems } = usePrintCart();

  // Reset page when search or measure changes
  const handleSearchChange = (val: string) => {
    setSearchTerm(val);
    setPage(0);
  };

  const handleMeasureChange = (measure: 0 | 1 | undefined) => {
    setMeasureFilter(measure);
    setPage(0);
  };

  const { data, isLoading, isFetching, error, refetch } = useProducts({
    first: page * pageSize,
    pageSize,
    measure: measureFilter,
    fullSearchCriteria: debouncedSearch || undefined,
  });

  const products: UmagProduct[] = data?.content || [];
  const totalCount = data?.totalCount || 0;
  const totalPages = Math.ceil(totalCount / pageSize);

  const isProductInCart = (barcode: number) => {
    return cartItems.some((item) => item.barcode === String(barcode));
  };

  const getProductCartCount = (barcode: number) => {
    return cartItems.find((item) => item.barcode === String(barcode))?.quantity || 0;
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Каталог и поиск товаров
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Актуальные продажные цены из системы Umag и добавление в очередь печати
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            disabled={isFetching}
            className="text-xs gap-1.5"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isFetching ? 'animate-spin' : ''}`} />
            Обновить
          </Button>
        </div>
      </div>

      {/* Search & Filter Toolbar */}
      <Card className="border-slate-200 shadow-sm bg-white">
        <CardContent className="p-4 sm:p-5">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            {/* Search Input with Debounce (300ms) */}
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input
                type="text"
                placeholder="Поиск по названию, штрихкоду или артикулу..."
                value={searchTerm}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="pl-10 pr-10 h-11 bg-slate-50/50 border-slate-200 focus:bg-white text-sm"
              />
              {searchTerm && (
                <button
                  type="button"
                  onClick={() => handleSearchChange('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600 px-1 py-0.5"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Measure Filter: All / Piece (0) / Weight (1) */}
            <div className="flex items-center p-1 bg-slate-100 rounded-lg border border-slate-200 self-start sm:self-auto">
              <button
                type="button"
                onClick={() => handleMeasureChange(undefined)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-md transition ${
                  measureFilter === undefined
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Все
              </button>
              <button
                type="button"
                onClick={() => handleMeasureChange(0)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-md transition ${
                  measureFilter === 0
                    ? 'bg-white text-blue-700 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Штучные
              </button>
              <button
                type="button"
                onClick={() => handleMeasureChange(1)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-md transition ${
                  measureFilter === 1
                    ? 'bg-white text-blue-700 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Весовые
              </button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Loading State */}
      {isLoading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {[...Array(8)].map((_, i) => (
            <div
              key={i}
              className="h-44 rounded-xl border border-slate-200 bg-white p-4 animate-pulse flex flex-col justify-between"
            >
              <div className="space-y-2">
                <div className="h-4 bg-slate-200 rounded w-3/4" />
                <div className="h-3 bg-slate-100 rounded w-1/2" />
              </div>
              <div className="h-8 bg-slate-100 rounded w-full" />
            </div>
          ))}
        </div>
      )}

      {/* Error State */}
      {error && !isLoading && (
        <div className="p-6 rounded-xl bg-red-50 border border-red-200 text-red-800 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
          <div>
            <h3 className="font-semibold text-sm">Не удалось загрузить товары</h3>
            <p className="text-xs mt-1 text-red-700">
              {error instanceof Error ? error.message : 'Произошла ошибка при запросе к серверу.'}
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => refetch()}
              className="mt-3 text-xs bg-white hover:bg-red-50 border-red-300 text-red-700"
            >
              Попробовать снова
            </Button>
          </div>
        </div>
      )}

      {/* Products Grid */}
      {!isLoading && !error && products.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs text-slate-500 px-1">
            <span>
              Найдено товаров: <strong className="text-slate-800">{totalCount}</strong>
            </span>
            <span>
              Страница {page + 1} из {Math.max(1, totalPages)}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {products.map((product) => {
              const inCart = isProductInCart(product.barcode);
              const cartCount = getProductCartCount(product.barcode);

              return (
                <div
                  key={product.id}
                  className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs hover:shadow-md transition-all flex flex-col justify-between group"
                >
                  <div className="space-y-2.5">
                    {/* Header: Measure & Barcode */}
                    <div className="flex items-center justify-between gap-2">
                      <Badge
                        variant="secondary"
                        className="text-[10px] font-medium px-2 py-0.5 bg-slate-100 text-slate-700"
                      >
                        <Layers className="w-3 h-3 mr-1 text-slate-400" />
                        {product.measureName || (product.type === 1 ? 'кг.' : 'шт.')}
                      </Badge>

                      <div className="flex items-center gap-1 text-[11px] font-mono text-slate-500">
                        <Barcode className="w-3.5 h-3.5 text-slate-400" />
                        <span>{product.barcode}</span>
                      </div>
                    </div>

                    {/* Product Name */}
                    <h2
                      className="font-semibold text-slate-900 text-sm leading-snug line-clamp-2 group-hover:text-blue-600 transition-colors"
                      title={product.fullName || product.name}
                    >
                      {product.name}
                    </h2>

                    {/* Additional barcodes if any */}
                    {product.aliasList && product.aliasList.length > 0 && (
                      <div className="text-[10px] text-slate-400 truncate">
                        Доп. ШК: {product.aliasList.join(', ')}
                      </div>
                    )}
                  </div>

                  {/* Price & Add To Queue Action */}
                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
                        Продажная цена
                      </span>
                      {/* CRITICAL: wholesalePrice is the selling price per state.md */}
                      <div className="flex items-baseline gap-1">
                        <span className="text-xl font-extrabold text-slate-950 tracking-tight">
                          {product.wholesalePrice.toLocaleString('ru-RU')}
                        </span>
                        <span className="text-xs font-bold text-slate-600">сум</span>
                      </div>
                    </div>

                    <Button
                      onClick={() => addItem(product, 1)}
                      size="sm"
                      variant={inCart ? 'secondary' : 'default'}
                      className={`h-9 px-3 text-xs gap-1.5 ${
                        inCart
                          ? 'bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100'
                          : 'bg-blue-600 hover:bg-blue-700 text-white'
                      }`}
                    >
                      {inCart ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-blue-600" />
                          <span>В очереди ({cartCount})</span>
                        </>
                      ) : (
                        <>
                          <Plus className="w-3.5 h-3.5" />
                          <span>+ В очередь</span>
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 pt-6">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.max(0, p - 1))}
                disabled={page === 0}
                className="gap-1 text-xs"
              >
                <ChevronLeft className="w-4 h-4" />
                Назад
              </Button>
              <span className="text-xs font-medium text-slate-600 px-3">
                {page + 1} / {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                disabled={page >= totalPages - 1}
                className="gap-1 text-xs"
              >
                Вперед
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          )}
        </div>
      )}

      {/* Empty State */}
      {!isLoading && !error && products.length === 0 && (
        <Card className="border-dashed border-slate-300 bg-white">
          <CardContent className="py-16 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto text-slate-400">
              <Package className="w-6 h-6" />
            </div>
            <h3 className="font-semibold text-slate-800 text-base">
              Товары не найдены
            </h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              {searchTerm
                ? `По запросу "${searchTerm}" ничего не найдено. Попробуйте изменить параметры поиска или сбросить фильтры.`
                : 'Список товаров пуст или не удалось получить данные от Umag API.'}
            </p>
            {searchTerm && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleSearchChange('')}
                className="text-xs"
              >
                Очистить поиск
              </Button>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
