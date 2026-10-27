'use client';

import React from 'react';
import { Button, Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/ui';
import { ZoomIn, ZoomOut, RotateCcw, Scale, Package, Magnet, Grid3X3 } from 'lucide-react';
import { SAMPLE_PRODUCTS } from '../../constants/sample-products';
import { cn } from '@/shared/lib/utils';

interface LabelPreviewToolbarProps {
  sampleIndex: number;
  onSampleChange: (index: number) => void;
  zoom: number;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onZoomReset: () => void;
  smartGuides?: boolean;
  onToggleSmartGuides?: () => void;
  showGrid?: boolean;
  onToggleGrid?: () => void;
}

export function LabelPreviewToolbar({
  sampleIndex,
  onSampleChange,
  zoom,
  onZoomIn,
  onZoomOut,
  onZoomReset,
  smartGuides = true,
  onToggleSmartGuides,
  showGrid = false,
  onToggleGrid,
}: LabelPreviewToolbarProps) {
  const currentProduct = SAMPLE_PRODUCTS[sampleIndex] || SAMPLE_PRODUCTS[0];

  return (
    <div className="w-full max-w-md mb-3 flex flex-col gap-2">
      {/* Быстрое переключение типов товаров: штучный vs весовой */}
      <div className="flex items-center justify-center gap-1.5 p-1 bg-slate-100/90 dark:bg-slate-800/90 rounded-xl border border-slate-200 dark:border-slate-700">
        {SAMPLE_PRODUCTS.map((prod, idx) => {
          const isSelected = sampleIndex === idx;
          const isWeight = Boolean(prod.isWeight);
          return (
            <button
              key={prod.name}
              type="button"
              onClick={() => onSampleChange(idx)}
              className={cn(
                'flex-1 flex items-center justify-center gap-1 px-2 py-1 rounded-lg text-[11px] font-semibold transition cursor-pointer',
                isSelected
                  ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-xs ring-1 ring-slate-200 dark:ring-slate-700'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              )}
            >
              {isWeight ? (
                <Scale className="size-3 text-amber-500 shrink-0" />
              ) : (
                <Package className="size-3 text-slate-400 shrink-0" />
              )}
              <span className="truncate max-w-[90px]">
                {isWeight ? `Вес (PLU ${prod.plu})` : prod.name.split(' ')[0]}
              </span>
            </button>
          );
        })}
      </div>

      {/* Панель масштаба и детальный выбор */}
      <div className="flex items-center justify-between px-2.5 py-1.5 bg-slate-100/90 dark:bg-slate-800/90 rounded-xl text-xs text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 shadow-2xs">
        <div className="flex items-center gap-1.5">
          <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400">Товар:</span>
          <Select
            value={String(sampleIndex)}
            onValueChange={(val) => onSampleChange(Number(val))}
          >
            <SelectTrigger className="h-7 text-[11px] max-w-[170px] px-2 py-0 bg-white dark:bg-slate-700 border-slate-200 dark:border-slate-600 font-medium">
              <SelectValue placeholder="Товар" />
            </SelectTrigger>
            <SelectContent>
              {SAMPLE_PRODUCTS.map((prod, idx) => (
                <SelectItem key={prod.name} value={String(idx)} className="text-xs">
                  {prod.isWeight ? `[Весовой PLU ${prod.plu}] ` : '[Штучный] '}
                  {prod.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-1">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={onZoomOut}
            className="h-6 w-6 p-0 hover:bg-white dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300"
            title="Уменьшить масштаб"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </Button>
          <span className="font-mono text-[10px] w-9 text-center font-bold">
            {Math.round(zoom * 100)}%
          </span>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={onZoomIn}
            className="h-6 w-6 p-0 hover:bg-white dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300"
            title="Увеличить масштаб"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </Button>
          {zoom !== 1 && (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={onZoomReset}
              className="h-6 w-6 p-0 hover:bg-white dark:hover:bg-slate-700 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
              title="Сбросить масштаб"
            >
              <RotateCcw className="w-3 h-3" />
            </Button>
          )}

          {/* Alignment & Grid Helper Toggles */}
          {(onToggleSmartGuides || onToggleGrid) && (
            <div className="flex items-center gap-1 border-l border-slate-200 dark:border-slate-700 pl-1.5 ml-1">
              {onToggleSmartGuides && (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={onToggleSmartGuides}
                  className={cn(
                    'h-6 w-6 p-0 transition-colors rounded-md',
                    smartGuides
                      ? 'bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-400 font-bold ring-1 ring-rose-300 dark:ring-rose-800'
                      : 'text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
                  )}
                  title={smartGuides ? 'Умные направляющие (Photoshop): ВКЛ' : 'Умные направляющие: ВЫКЛ'}
                >
                  <Magnet className="w-3.5 h-3.5" />
                </Button>
              )}

              {onToggleGrid && (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={onToggleGrid}
                  className={cn(
                    'h-6 w-6 p-0 transition-colors rounded-md',
                    showGrid
                      ? 'bg-blue-100 text-blue-700 dark:bg-blue-950/60 dark:text-blue-400 font-bold ring-1 ring-blue-300 dark:ring-blue-800'
                      : 'text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
                  )}
                  title={showGrid ? 'Сетка холста: ВКЛ' : 'Сетка холста: ВЫКЛ'}
                >
                  <Grid3X3 className="w-3.5 h-3.5" />
                </Button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
