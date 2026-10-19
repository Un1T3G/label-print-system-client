'use client';

import React from 'react';
import { Card, CardContent, Button } from '@/shared/ui';
import { Package } from 'lucide-react';

interface ProductsEmptyStateProps {
  searchTerm?: string;
  onClearSearch?: () => void;
}

export function ProductsEmptyState({
  searchTerm,
  onClearSearch,
}: ProductsEmptyStateProps) {
  return (
    <Card className="border-dashed">
      <CardContent className="py-16 flex flex-col items-center justify-center gap-3 text-center">
        <div className="size-12 rounded-full bg-muted flex items-center justify-center text-muted-foreground">
          <Package className="size-6" />
        </div>
        <h3 className="font-semibold text-foreground text-base">
          Товары не найдены
        </h3>
        <p className="text-xs text-muted-foreground max-w-sm">
          {searchTerm
            ? `По запросу "${searchTerm}" ничего не найдено. Попробуйте изменить параметры поиска или сбросить фильтры.`
            : 'Список товаров пуст или не удалось получить данные от Umag API.'}
        </p>
        {searchTerm && onClearSearch && (
          <Button
            variant="outline"
            size="sm"
            onClick={onClearSearch}
          >
            Очистить поиск
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
