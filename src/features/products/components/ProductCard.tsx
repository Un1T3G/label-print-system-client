'use client';

import React, { useState } from 'react';
import type { UmagProduct } from '../types';
import {
  Card,
  CardHeader,
  CardContent,
  CardFooter,
  Button,
  Badge,
  Popover,
  PopoverTrigger,
  PopoverContent,
} from '@/shared/ui';
import { Layers, Barcode, Plus, Minus, Trash2, Scale, Copy, Check, Package } from 'lucide-react';
import { toast } from 'sonner';

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
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const isWeight =
    product.type === 1 ||
    product.measureName?.toLowerCase().includes('кг') ||
    product.name?.toLowerCase().includes(' кг') ||
    product.fullName?.toLowerCase().includes(' кг');

  const aliases = product.aliasList || [];
  const hasMultipleAliases = aliases.length > 1;

  const handleCopyBarcode = (code: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    toast.success(`Штрихкод скопирован: ${code}`);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  return (
    <Card className="flex flex-col justify-between hover:ring-2 hover:ring-primary/20 hover:border-primary/40 transition-all duration-200 group h-full">
      <CardHeader className="gap-2.5 pb-2">
        {/* Measure & Primary Barcode */}
        <div className="flex items-center justify-between gap-2">
          <Badge variant="secondary" className="gap-1.5 font-medium text-xs px-2 py-0.5 shrink-0">
            {isWeight ? (
              <Scale className="size-3 text-muted-foreground" />
            ) : (
              <Package className="size-3 text-muted-foreground" />
            )}
            <span>{product.measureName || (isWeight ? 'кг.' : 'шт.')}</span>
          </Badge>

          <button
            type="button"
            onClick={(e) => handleCopyBarcode(String(product.barcode), e)}
            className="flex items-center gap-1.5 text-xs font-mono text-muted-foreground bg-muted/60 hover:bg-muted hover:text-foreground px-2 py-0.5 rounded-md transition-colors"
            title="Нажмите, чтобы скопировать основной штрихкод"
          >
            <Barcode className="size-3.5 text-muted-foreground shrink-0" />
            <span className="tabular-nums">{product.barcode}</span>
          </button>
        </div>

        {/* Product Name */}
        <h3
          className="font-medium text-foreground text-sm leading-snug line-clamp-2 min-h-[2.5rem] group-hover:text-primary transition-colors"
          title={product.fullName || product.name}
        >
          {product.name}
        </h3>
      </CardHeader>

      {/* Barcodes / Tara Container — strictly bounded height, never expands the whole screen */}
      <CardContent className="pt-0 pb-2">
        {aliases.length > 0 ? (
          <div className="flex items-center gap-1.5 flex-wrap min-h-[1.75rem]">
            <span className="text-[11px] font-medium text-muted-foreground shrink-0">
              {isWeight ? 'PLU:' : 'Тара / ШК:'}
            </span>

            {/* First Alias Barcode */}
            <span
              onClick={(e) => handleCopyBarcode(aliases[0], e)}
              className="inline-flex items-center gap-1 font-mono text-xs font-semibold text-foreground/90 bg-muted/50 hover:bg-muted px-1.5 py-0.5 rounded border border-border/60 cursor-pointer transition-colors"
              title="Нажмите для копирования"
            >
              {aliases[0]}
            </span>

            {/* If 2 or more aliases, show compact popover button — NEVER balloons card */}
            {hasMultipleAliases && (
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    size="xs"
                    className="h-5 px-1.5 text-[10px] font-semibold gap-1 text-primary hover:text-primary border-primary/30 hover:border-primary/60 hover:bg-primary/5"
                    title={`Показать все ${aliases.length} штрихкодов тары и упаковок`}
                  >
                    <Layers className="size-3" />
                    <span>+{aliases.length - 1} тары</span>
                  </Button>
                </PopoverTrigger>
                <PopoverContent
                  align="start"
                  side="bottom"
                  className="w-72 p-3 shadow-xl max-h-56 overflow-y-auto"
                >
                  <div className="flex items-center justify-between pb-2 mb-2 border-b border-border">
                    <span className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                      <Layers className="size-3.5 text-primary" />
                      Штрихкоды тары ({aliases.length})
                    </span>
                    <span className="text-[10px] text-muted-foreground">нажмите для копирования</span>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    {aliases.map((code, idx) => (
                      <div
                        key={code}
                        onClick={() => handleCopyBarcode(code)}
                        className="flex items-center justify-between px-2 py-1.5 rounded-md hover:bg-muted text-xs font-mono cursor-pointer transition-colors group/item"
                      >
                        <span className="text-foreground">
                          <span className="text-[10px] text-muted-foreground mr-1.5">#{idx + 1}</span>
                          {code}
                        </span>
                        <div className="text-muted-foreground group-hover/item:text-foreground">
                          {copiedCode === code ? (
                            <Check className="size-3.5 text-emerald-500" />
                          ) : (
                            <Copy className="size-3.5 opacity-60 group-hover/item:opacity-100" />
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </PopoverContent>
              </Popover>
            )}
          </div>
        ) : (
          <div className="min-h-[1.75rem]" />
        )}
      </CardContent>

      {/* Price & Actions — standardized sizes and spacing */}
      <CardFooter className="flex flex-col pt-2 pb-3.5 gap-2 border-t border-border/40 mt-auto">
        {/* Price row */}
        <div className="flex items-center justify-between w-full">
          <div>
            <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider block leading-tight">
              Продажная цена
            </span>
            <div className="flex items-baseline gap-1 mt-0.5">
              <span className="text-lg font-bold tracking-tight text-foreground">
                {product.wholesalePrice.toLocaleString('ru-RU')}
              </span>
              <span className="text-xs font-medium text-muted-foreground">сум</span>
            </div>
          </div>

          {!inCart ? (
            <Button
              onClick={() => onAddToCart(product)}
              size="sm"
              variant="default"
              className="gap-1.5 shadow-xs"
            >
              <Plus className="size-3.5 shrink-0" />
              <span>В очередь</span>
            </Button>
          ) : (
            <div className="flex items-center gap-1 bg-muted/60 p-0.5 rounded-lg border border-border">
              {/* Decrement / Remove */}
              <Button
                type="button"
                variant="ghost"
                size="icon-xs"
                onClick={() => onDecrement?.(product)}
                className={
                  cartCount === 1
                    ? 'text-muted-foreground hover:text-destructive hover:bg-destructive/10'
                    : 'text-muted-foreground hover:text-foreground'
                }
                title={cartCount === 1 ? 'Убрать из очереди' : 'Уменьшить количество'}
              >
                {cartCount === 1 ? (
                  <Trash2 className="size-3.5" />
                ) : (
                  <Minus className="size-3.5" />
                )}
              </Button>

              {/* Quantity Count */}
              <span className="w-6 text-center text-xs font-bold text-foreground tabular-nums select-none">
                {cartCount}
              </span>

              {/* Increment */}
              <Button
                type="button"
                variant="ghost"
                size="icon-xs"
                onClick={() => onAddToCart(product)}
                className="text-muted-foreground hover:text-primary hover:bg-primary/10"
                title="Увеличить количество"
              >
                <Plus className="size-3.5" />
              </Button>
            </div>
          )}
        </div>
      </CardFooter>
    </Card>
  );
}
