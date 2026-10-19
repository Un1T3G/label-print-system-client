'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useProductsInfinite } from '../hooks/use-products-infinite';
import { useBarcodeScannerListener } from '../hooks/use-barcode-scanner';
import type { UmagProduct } from '../types';
import { usePrintCart } from '@/features/print';
import { useDebounce } from '@/shared/lib/use-debounce';
import { Button, Alert, AlertTitle, AlertDescription } from '@/shared/ui';
import { RefreshCw, AlertCircle, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import {
  ProductsToolbar,
  ProductCard,
  ProductsEmptyState,
  ProductsLoadingSkeleton,
} from './index';

export function ProductsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [measureFilter, setMeasureFilter] = useState<0 | 1 | undefined>(undefined);
  const pageSize = 24;

  const debouncedSearch = useDebounce(searchTerm, 300);

  const {
    data,
    isLoading,
    error,
    refetch,
    isFetching,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useProductsInfinite({
    search: debouncedSearch,
    measure: measureFilter,
    pageSize,
  });

  const { items: cartItems, addItem, updateQuantity, removeItem } = usePrintCart();

  // Flatten all pages into one list
  const products: UmagProduct[] = data?.pages.flatMap((p) => p.content) ?? [];
  const totalCount = data?.pages[0]?.totalCount ?? 0;

  // Sentinel ref for IntersectionObserver (infinite scroll trigger)
  const sentinelRef = useRef<HTMLDivElement>(null);

  const handleObserver = useCallback(
    (entries: IntersectionObserverEntry[]) => {
      const [entry] = entries;
      if (entry.isIntersecting && hasNextPage && !isFetchingNextPage) {
        fetchNextPage();
      }
    },
    [hasNextPage, isFetchingNextPage, fetchNextPage]
  );

  useEffect(() => {
    const element = sentinelRef.current;
    if (!element) return;
    const observer = new IntersectionObserver(handleObserver, {
      root: null,
      rootMargin: '200px', // pre-load 200px before reaching bottom
      threshold: 0,
    });
    observer.observe(element);
    return () => observer.disconnect();
  }, [handleObserver]);

  const handleSearchChange = (val: string) => {
    setSearchTerm(val);
  };

  const handleMeasureChange = (val: 0 | 1 | undefined) => {
    setMeasureFilter(val);
  };

  // Hardware USB/Bluetooth barcode scanner listener
  useBarcodeScannerListener({
    onScan: (barcode) => {
      handleSearchChange(barcode);
      toast.success(`Отсканирован штрихкод: ${barcode}`);
    },
  });

  const isProductInCart = (barcode: number) =>
    cartItems.some((item) => item.barcode === String(barcode));

  const getProductCartCount = (barcode: number) =>
    cartItems.find((item) => item.barcode === String(barcode))?.quantity || 0;

  const handleDecrement = (product: UmagProduct) => {
    const current = getProductCartCount(product.barcode);
    if (current <= 1) {
      removeItem(String(product.barcode));
    } else {
      updateQuantity(String(product.barcode), current - 1);
    }
  };

  const [isScannerOpen, setIsScannerOpen] = useState(false);

  return (
    <div className="flex flex-col gap-4 sm:gap-6">
      {/* Top Banner & Header */}
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
            Каталог товаров
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5 hidden sm:block">
            Актуальные продажные цены из системы Umag и добавление в очередь печати
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={() => refetch()}
          disabled={isFetching}
          className="shrink-0"
        >
          <RefreshCw
            data-icon="inline-start"
            className={isFetching ? 'animate-spin' : ''}
          />
          <span className="hidden sm:inline">Обновить</span>
        </Button>
      </div>

      {/* Search & Filter Toolbar with Embedded Barcode Scanner */}
      <ProductsToolbar
        searchTerm={searchTerm}
        onSearchChange={handleSearchChange}
        measureFilter={measureFilter}
        onMeasureChange={handleMeasureChange}
        isScannerOpen={isScannerOpen}
        onToggleScanner={() => setIsScannerOpen((prev) => !prev)}
        onCloseScanner={() => setIsScannerOpen(false)}
        onScanBarcode={(barcode) => {
          handleSearchChange(barcode);
          toast.success(`Штрихкод успешно отсканирован: ${barcode}`);
        }}
      />

      {/* Initial Loading Skeleton */}
      {isLoading && <ProductsLoadingSkeleton count={pageSize} />}

      {/* Error State */}
      {error && !isLoading && (
        <Alert variant="destructive">
          <AlertCircle />
          <AlertTitle>Не удалось загрузить товары</AlertTitle>
          <AlertDescription className="flex flex-col gap-3">
            <span>
              {error instanceof Error ? error.message : 'Произошла ошибка при запросе к серверу.'}
            </span>
            <div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => refetch()}
              >
                Попробовать снова
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* Products Grid */}
      {!isLoading && !error && products.length > 0 && (
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between text-xs text-muted-foreground px-1">
            <span>
              Найдено: <strong className="text-foreground">{totalCount}</strong> товаров
            </span>
            <span>
              Загружено: <strong className="text-foreground">{products.length}</strong>
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {products.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                inCart={isProductInCart(product.barcode)}
                cartCount={getProductCartCount(product.barcode)}
                onAddToCart={(p) => addItem(p, 1)}
                onDecrement={handleDecrement}
              />
            ))}
          </div>

          {/* Sentinel element — triggers next page load when visible */}
          <div ref={sentinelRef} className="h-4" />

          {/* Loading next page indicator */}
          {isFetchingNextPage && (
            <div className="flex items-center justify-center py-6 gap-2 text-sm text-muted-foreground">
              <Loader2 className="size-4 animate-spin" />
              <span>Загружаем ещё...</span>
            </div>
          )}

          {/* End of list indicator */}
          {!hasNextPage && products.length > 0 && (
            <div className="text-center py-4 text-xs text-muted-foreground">
              Показаны все {totalCount} товаров
            </div>
          )}
        </div>
      )}

      {/* Empty State */}
      {!isLoading && !error && products.length === 0 && (
        <ProductsEmptyState
          searchTerm={searchTerm}
          onClearSearch={() => handleSearchChange('')}
        />
      )}
    </div>
  );
}
