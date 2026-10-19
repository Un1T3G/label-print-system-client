'use client';

import React from 'react';
import { Button, Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/ui';
import { ZoomIn, ZoomOut, RotateCcw } from 'lucide-react';
import { SAMPLE_PRODUCTS } from '../../constants/sample-products';

interface LabelPreviewToolbarProps {
  sampleIndex: number;
  onSampleChange: (index: number) => void;
  zoom: number;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onZoomReset: () => void;
}

export function LabelPreviewToolbar({
  sampleIndex,
  onSampleChange,
  zoom,
  onZoomIn,
  onZoomOut,
  onZoomReset,
}: LabelPreviewToolbarProps) {
  return (
    <div className="flex items-center justify-between w-full max-w-sm mb-3 px-2.5 py-1.5 bg-slate-100/90 dark:bg-slate-800/90 rounded-xl text-xs text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 shadow-2xs">
      <div className="flex items-center gap-1.5">
        <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400">Товар:</span>
        <Select
          value={String(sampleIndex)}
          onValueChange={(val) => onSampleChange(Number(val))}
        >
          <SelectTrigger className="h-7 text-[11px] max-w-[145px] px-2 py-0 bg-white dark:bg-slate-700 border-slate-200 dark:border-slate-600">
            <SelectValue placeholder="Товар" />
          </SelectTrigger>
          <SelectContent>
            {SAMPLE_PRODUCTS.map((prod, idx) => (
              <SelectItem key={prod.name} value={String(idx)} className="text-xs">
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
      </div>
    </div>
  );
}
