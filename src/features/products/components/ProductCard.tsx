'use client';

import React from 'react';
import type { UmagProduct } from '../types';
import {
  Card,
  CardHeader,
  CardContent,
  CardFooter,
  Button,
  Badge,
} from '@/shared/ui';
import { Layers, Barcode, Plus, Minus, Trash2, Scale } from 'lucide-react';
import { cn } from '@/shared/lib/utils';

interface ProductCardProps {
  product: UmagProduct;
  inCart: boolean;
  cartCount: number;
  onAddToCart: (product: UmagProduct) => void;
  onDecrement?: (product: UmagProduct) => void;
}

export function ProductCard({
  product,
  inCart,
  cartCount,
  onAddToCart,
  onDecrement,
}: ProductCardProps) {
  const isWeight =
    product.type === 1 ||
    product.measureName?.toLowerCase().includes('кг') ||
    product.name?.toLowerCase().includes(' кг') ||
    product.fullName?.toLowerCase().includes(' кг');

  return (
    <Card className="flex flex-col justify-between hover:ring-2 hover:ring-primary/20 transition-shadow duration-200 group">
      <CardHeader className="gap-2 pb-2">
        {/* Measure & Barcode */}
        <div className="flex items-center justify-between gap-2">
          <Badge variant="secondary" className="gap-1 font-normal text-[11px]">
            {isWeight ? (
              <Scale className="size-3 text-muted-foreground" />
            ) : (
              <Layers className="size-3 text-muted-foreground" />
            )}
            {product.measureName || (isWeight ? 'кг.' : 'шт.')}
          </Badge>

          <div className="flex items-center gap-1 text-xs font-mono text-muted-foreground">
            <Barcode className="size-3.5 text-muted-foreground" />
            <span>{product.barcode}</span>
          </div>
        </div>

        {/* Product Name */}
        <h2
          className="font-medium text-foreground text-sm leading-snug line-clamp-2 group-hover:text-primary transition-colors"
          title={product.fullName || product.name}
        >
          {product.name}
        </h2>
      </CardHeader>

      <CardContent className="pt-0 pb-1">
        {product.aliasList && product.aliasList.length > 0 && (
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-medium text-muted-foreground">
              {isWeight ? 'PLU:' : 'Доп. ШК:'}
            </span>
            <span className="font-mono text-sm font-bold text-foreground tracking-wide">
              {product.aliasList.join(', ')}
            </span>
          </div>
        )}
      </CardContent>

      {/* Price & Actions — fixed layout, no shifts */}
      <CardFooter className="flex flex-col pt-3 gap-0">
        {/* Price row — always visible */}
        <div className="flex items-center justify-between w-full">
          <div>
            <span className="text-[10px] uppercase font-bold text-muted-foreground block tracking-wider">
              Продажная цена
            </span>
            <div className="flex items-baseline gap-1">
              <span className="text-xl font-bold tracking-tight text-foreground">
                {product.wholesalePrice.toLocaleString('ru-RU')}
              </span>
              <span className="text-xs font-medium text-muted-foreground">сум</span>
            </div>
          </div>

          {/* "В очередь" button — fades out when inCart */}
          <Button
            onClick={() => onAddToCart(product)}
            size="sm"
            variant="default"
            aria-hidden={inCart}
            className={cn(
              'h-9 transition-all duration-200 ease-in-out',
              inCart
                ? 'opacity-0 scale-90 pointer-events-none w-0 px-0 overflow-hidden'
                : 'opacity-100 scale-100'
            )}
          >
            <Plus className="size-3.5 shrink-0" />
            <span>В очередь</span>
          </Button>
        </div>

        {/* Stepper row — fades in when inCart, takes no space when hidden */}
        <div
          className={cn(
            'w-full overflow-hidden transition-all duration-200 ease-in-out',
            inCart ? 'max-h-12 opacity-100 mt-2' : 'max-h-0 opacity-0 mt-0'
          )}
        >
          <div className="flex items-center justify-between border-t border-border pt-2">
            {/* Status label */}
            <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400 select-none">
              В очереди
            </span>

            {/* Stepper controls */}
            <div className="flex items-center gap-0.5">
              {/* Decrement / Remove */}
              <Button
                type="button"
                variant="ghost"
                size="icon-xs"
                onClick={() => onDecrement?.(product)}
                tabIndex={inCart ? 0 : -1}
                className={cn(
                  'h-8 w-8 rounded-lg transition-colors duration-150',
                  cartCount === 1
                    ? 'text-muted-foreground hover:text-destructive hover:bg-destructive/10'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                )}
                title={cartCount === 1 ? 'Убрать из очереди' : 'Уменьшить'}
              >
                {cartCount === 1
                  ? <Trash2 className="size-3.5" />
                  : <Minus className="size-3.5" />
                }
              </Button>

              {/* Count */}
              <span className="w-7 text-center text-sm font-bold text-foreground tabular-nums select-none">
                {cartCount}
              </span>

              {/* Increment */}
              <Button
                type="button"
                variant="ghost"
                size="icon-xs"
                onClick={() => onAddToCart(product)}
                tabIndex={inCart ? 0 : -1}
                className="h-8 w-8 rounded-lg text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors duration-150"
                title="Увеличить"
              >
                <Plus className="size-3.5" />
              </Button>
            </div>
          </div>
        </div>
      </CardFooter>
    </Card>
  );
}
