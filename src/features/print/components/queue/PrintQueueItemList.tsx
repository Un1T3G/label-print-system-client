'use client';

import React from 'react';
import type { PrintJobItem } from '../../types';
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  Badge,
} from '@/shared/ui';
import { Eye, Minus, Plus, Trash2 } from 'lucide-react';

interface PrintQueueItemListProps {
  items: PrintJobItem[];
  totalLabelsCount: number;
  currencySymbol?: string;
  previewItemIndex: number;
  onSelectPreviewItem: (index: number) => void;
  onUpdateQuantity: (barcode: string, qty: number) => void;
  onRemoveItem: (barcode: string) => void;
}

export function PrintQueueItemList({
  items,
  totalLabelsCount,
  currencySymbol = 'сум',
  previewItemIndex,
  onSelectPreviewItem,
  onUpdateQuantity,
  onRemoveItem,
}: PrintQueueItemListProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-3 border-b border-border">
        <div>
          <CardTitle className="text-base">Позиции к печати</CardTitle>
          <CardDescription className="text-xs">
            {items.length} уникальных позиций, всего {totalLabelsCount} шт. ценников
          </CardDescription>
        </div>
        <Badge variant="secondary" className="font-mono text-xs">
          {totalLabelsCount} ценников
        </Badge>
      </CardHeader>
      <CardContent className="p-0">
        <div className="divide-y divide-border">
          {items.map((item, index) => (
            <div
              key={item.barcode}
              className={`p-3.5 sm:p-4 flex flex-col gap-3 transition-colors ${
                previewItemIndex === index
                  ? 'bg-accent/50'
                  : 'hover:bg-muted/40'
              }`}
            >
              {/* Top row: info + preview button */}
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 flex flex-col gap-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-mono text-muted-foreground">
                      #{item.barcode}
                    </span>
                    <Badge variant="outline" className="text-[10px] font-normal px-1.5 py-0">
                      {item.measureName}
                    </Badge>
                  </div>
                  <h4 className="font-semibold text-foreground text-sm leading-snug">
                    {item.name}
                  </h4>
                  <div className="text-base font-bold text-foreground">
                    {item.price.toLocaleString('ru-RU')} {currencySymbol}
                  </div>
                </div>

                <Button
                  variant={previewItemIndex === index ? 'secondary' : 'ghost'}
                  size="sm"
                  onClick={() => onSelectPreviewItem(index)}
                  title="Посмотреть предпросмотр этого ценника"
                  className="shrink-0"
                >
                  <Eye data-icon="inline-start" />
                  <span className="hidden sm:inline">Превью</span>
                </Button>
              </div>

              {/* Bottom row: quantity controls + delete */}
              <div className="flex items-center justify-between gap-2 pt-1 border-t border-border">
                {/* Quantity Controls */}
                <div className="flex items-center border border-border rounded-lg bg-card overflow-hidden shadow-2xs">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => onUpdateQuantity(item.barcode, item.quantity - 1)}
                    className="rounded-none text-muted-foreground hover:text-foreground h-10 w-10 sm:h-8 sm:w-8"
                    title="Уменьшить"
                  >
                    <Minus className="size-4" />
                  </Button>
                  <input
                    type="number"
                    min="1"
                    value={item.quantity}
                    onChange={(e) => {
                      const val = parseInt(e.target.value, 10);
                      if (!isNaN(val)) onUpdateQuantity(item.barcode, Math.max(1, val));
                    }}
                    className="w-14 text-center text-sm font-bold text-foreground bg-transparent focus:outline-none py-2"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => onUpdateQuantity(item.barcode, item.quantity + 1)}
                    className="rounded-none text-muted-foreground hover:text-foreground h-10 w-10 sm:h-8 sm:w-8"
                    title="Увеличить"
                  >
                    <Plus className="size-4" />
                  </Button>
                </div>

                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <span>{item.quantity} ценник{item.quantity === 1 ? '' : item.quantity < 5 ? 'а' : 'ов'}</span>
                </div>

                {/* Delete button */}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onRemoveItem(item.barcode)}
                  className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 h-10 w-10 sm:h-8 sm:w-8 shrink-0"
                  title="Удалить из очереди"
                >
                  <Trash2 className="size-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
