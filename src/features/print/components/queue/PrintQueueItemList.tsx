'use client';

import React from 'react';
import type { PrintJobItem } from '../../types';
import type { PrintTemplate } from '@/features/templates';
import { isWeightProduct } from '@/features/templates';
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  Badge,
} from '@/shared/ui';
import { Eye, Minus, Plus, Trash2, Barcode, Check, Scale, Tag } from 'lucide-react';
import { cn } from '@/shared/lib/utils';

interface PrintQueueItemListProps {
  items: PrintJobItem[];
  totalLabelsCount: number;
  currencySymbol?: string;
  previewItemIndex: number;
  getItemTemplate?: (item: PrintJobItem) => PrintTemplate;
  onSelectPreviewItem: (index: number) => void;
  onUpdateQuantity: (barcode: string, qty: number) => void;
  onRemoveItem: (barcode: string) => void;
}

export function PrintQueueItemList({
  items,
  totalLabelsCount,
  currencySymbol = 'сум',
  previewItemIndex,
  getItemTemplate,
  onSelectPreviewItem,
  onUpdateQuantity,
  onRemoveItem,
}: PrintQueueItemListProps) {
  return (
    <Card className="shadow-xs">
      <CardHeader className="flex flex-row items-center justify-between pb-3.5 border-b border-border">
        <div>
          <CardTitle className="text-base font-semibold">Позиции к печати</CardTitle>
          <CardDescription className="text-xs mt-0.5">
            {items.length} поз., суммарно {totalLabelsCount} шт. ценников
          </CardDescription>
        </div>
        <Badge variant="secondary" className="font-mono text-xs px-2.5 py-1">
          {totalLabelsCount} шт.
        </Badge>
      </CardHeader>

      <CardContent className="p-3 sm:p-4">
        <div className="flex flex-col gap-3">
          {items.map((item, index) => {
            const isSelected = previewItemIndex === index;
            const totalPrice = item.price * item.quantity;
            const resolvedTpl = getItemTemplate?.(item);
            const isWeight = isWeightProduct(item);

            return (
              <div
                key={item.barcode}
                className={cn(
                  'rounded-xl border p-3.5 sm:p-4 transition-all duration-200 flex flex-col gap-3 bg-card',
                  isSelected
                    ? 'border-primary/50 ring-2 ring-primary/20 bg-primary/[0.02] shadow-xs'
                    : 'border-border/80 hover:border-border hover:bg-muted/20'
                )}
              >
                {/* Top Row: Barcode, Measure Badge and Preview Button */}
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <div className="flex items-center gap-2 flex-wrap">
                    <div className="flex items-center gap-1.5 text-xs font-mono text-muted-foreground bg-muted/60 px-2 py-0.5 rounded-md">
                      <Barcode className="size-3.5 text-muted-foreground shrink-0" />
                      <span className="tabular-nums">{item.barcode}</span>
                    </div>

                    {isWeight ? (
                      <Badge
                        variant="outline"
                        className="text-xs bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 px-2 py-0.5 font-medium gap-1"
                      >
                        <Scale className="size-3" />
                        <span>кг</span>
                        {(item.aliasList?.[0] || item.plu) && (
                          <span className="font-mono font-bold">
                            PLU: {item.aliasList?.[0] || item.plu}
                          </span>
                        )}
                      </Badge>
                    ) : (
                      <Badge
                        variant="outline"
                        className="text-xs bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20 px-2 py-0.5 font-medium gap-1"
                      >
                        <Tag className="size-3" />
                        <span>{item.measureName || 'шт.'}</span>
                      </Badge>
                    )}

                    {resolvedTpl && (
                      <Badge variant="secondary" className="text-[10px] text-muted-foreground font-normal px-2 py-0.5">
                        Шаблон: {resolvedTpl.name}
                      </Badge>
                    )}
                  </div>


                  {isSelected ? (
                    <Badge
                      variant="default"
                      className="gap-1.5 h-7 px-2.5 text-xs font-medium bg-primary text-primary-foreground shadow-2xs"
                    >
                      <Check className="size-3.5" />
                      <span>В превью</span>
                    </Badge>
                  ) : (
                    <Button
                      variant="outline"
                      size="xs"
                      onClick={() => onSelectPreviewItem(index)}
                      className="gap-1.5 text-xs text-muted-foreground hover:text-foreground"
                      title="Показать этот ценник в окне предпросмотра"
                    >
                      <Eye className="size-3.5" />
                      <span>Предпросмотр</span>
                    </Button>
                  )}
                </div>

                {/* Middle Row: Product Title & Price Details */}
                <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2">
                  <h3
                    className="font-semibold text-foreground text-sm sm:text-base leading-snug line-clamp-2 flex-1"
                    title={item.name}
                  >
                    {item.name}
                  </h3>

                  <div className="flex flex-col sm:items-end shrink-0">
                    <div className="flex items-baseline gap-1">
                      <span className="text-base sm:text-lg font-bold text-foreground">
                        {item.price.toLocaleString('ru-RU')}
                      </span>
                      <span className="text-xs text-muted-foreground">{currencySymbol}</span>
                      <span className="text-[11px] text-muted-foreground font-normal">/ {item.measureName || 'шт.'}</span>
                    </div>

                    {item.quantity > 1 && (
                      <span className="text-xs font-medium text-primary">
                        Итого: {totalPrice.toLocaleString('ru-RU')} {currencySymbol}
                      </span>
                    )}
                  </div>
                </div>

                {/* Bottom Row: Quantity Stepper, Quick Presets & Remove Button */}
                <div className="flex items-center justify-between gap-3 pt-2.5 border-t border-border/60">
                  {/* Quantity Stepper */}
                  <div className="flex items-center gap-2">
                    <div className="flex items-center bg-muted/60 p-0.5 rounded-lg border border-border">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon-xs"
                        onClick={() => onUpdateQuantity(item.barcode, item.quantity - 1)}
                        className={
                          item.quantity === 1
                            ? 'text-muted-foreground hover:text-destructive hover:bg-destructive/10'
                            : 'text-muted-foreground hover:text-foreground'
                        }
                        title={item.quantity === 1 ? 'Удалить из очереди' : 'Уменьшить на 1'}
                      >
                        {item.quantity === 1 ? (
                          <Trash2 className="size-3.5" />
                        ) : (
                          <Minus className="size-3.5" />
                        )}
                      </Button>

                      <input
                        type="number"
                        min="1"
                        value={item.quantity}
                        onChange={(e) => {
                          const val = parseInt(e.target.value, 10);
                          if (!isNaN(val)) onUpdateQuantity(item.barcode, Math.max(1, val));
                        }}
                        className="w-10 text-center text-xs font-bold text-foreground bg-transparent focus:outline-none py-1 tabular-nums"
                      />

                      <Button
                        type="button"
                        variant="ghost"
                        size="icon-xs"
                        onClick={() => onUpdateQuantity(item.barcode, item.quantity + 1)}
                        className="text-muted-foreground hover:text-primary hover:bg-primary/10"
                        title="Увеличить на 1"
                      >
                        <Plus className="size-3.5" />
                      </Button>
                    </div>

                    {/* Quick quantity preset pills */}
                    <div className="hidden sm:flex items-center gap-1">
                      {[5, 10, 20].map((preset) => (
                        <button
                          key={preset}
                          type="button"
                          onClick={() => onUpdateQuantity(item.barcode, preset)}
                          className={cn(
                            'h-7 px-2 text-[11px] font-medium rounded-md border transition-colors',
                            item.quantity === preset
                              ? 'bg-primary text-primary-foreground border-primary'
                              : 'bg-muted/40 hover:bg-muted text-muted-foreground hover:text-foreground border-border/70'
                          )}
                          title={`Установить ровно ${preset} ценников`}
                        >
                          +{preset}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Right: Quantity summary & Delete button */}
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground hidden sm:inline">
                      {item.quantity} шт.
                    </span>

                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-xs"
                      onClick={() => onRemoveItem(item.barcode)}
                      className="text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                      title="Удалить позицию"
                    >
                      <Trash2 className="size-3.5" />
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
