'use client';

import React from 'react';
import type { ElementInspectorProps } from '../../../model/element-registry-types';
import {
  Label,
  Slider,
  Switch,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/ui';
import { getElementDefinition } from '../../../model/element-registry';

export function InspectorBarcodeControls({ element, onUpdate }: ElementInspectorProps) {
  const definition = getElementDefinition(element.type);
  if (!definition.capabilities.hasBarcodeSettings) return null;

  return (
    <div className="space-y-3 pt-2 border-t border-slate-100 dark:border-slate-800">
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1">
          <label className="text-[11px] font-semibold text-slate-700 dark:text-slate-300">
            Формат штрихкода:
          </label>
          <Select
            value={element.barcodeType || '128'}
            onValueChange={(val) =>
              onUpdate('barcodeType', val as '128' | 'EAN13')
            }
          >
            <SelectTrigger className="w-full h-8 rounded-lg border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs">
              <SelectValue placeholder="Тип штрихкода" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="128">CODE 128 (Универсальный)</SelectItem>
              <SelectItem value="EAN13">EAN-13 (13 цифр)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1">
          <label className="text-[11px] font-semibold text-slate-700 dark:text-slate-300">
            Ширина штрихов (модуль):
          </label>
          <Select
            value={String(element.barcodeWidth || 2)}
            onValueChange={(val) => onUpdate('barcodeWidth', Number(val))}
          >
            <SelectTrigger className="w-full h-8 rounded-lg border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs">
              <SelectValue placeholder="Ширина штрихов" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1">1x (Тонкий, для компактных)</SelectItem>
              <SelectItem value="2">2x (Стандартный 203 DPI)</SelectItem>
              <SelectItem value="3">3x (Широкий / Крупный)</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label className="text-xs font-medium">
            Высота штрихов:
          </Label>
          <span className="text-xs font-mono font-bold text-primary">
            {element.barcodeHeight || 42} pt
          </span>
        </div>
        <Slider
          min={16}
          max={70}
          step={1}
          value={[element.barcodeHeight || 42]}
          onValueChange={([val]) => onUpdate('barcodeHeight', val)}
          className="mt-1"
        />
      </div>

      <div className="flex items-center justify-between py-1 border-t border-slate-100 dark:border-slate-800/60">
        <div>
          <span className="text-xs font-medium text-slate-800 dark:text-slate-200 block">
            Читаемые цифры под штрихкодом
          </span>
          <span className="text-[10px] text-muted-foreground block">
            Отображает цифровой номер под полосами
          </span>
        </div>
        <Switch
          checked={element.showBarcodeDigits !== false}
          onCheckedChange={(val) => onUpdate('showBarcodeDigits', val)}
        />
      </div>

      <div className="flex items-center justify-between py-1 border-t border-slate-100 dark:border-slate-800/60">
        <div>
          <span className="text-xs font-medium text-slate-800 dark:text-slate-200 block">
            Скрывать для весовых товаров
          </span>
          <span className="text-[10px] text-muted-foreground block">
            Если включено, штрихкод не печатается на весовом товаре
          </span>
        </div>
        <Switch
          checked={Boolean(element.barcodeHideOnWeight)}
          onCheckedChange={(val) => onUpdate('barcodeHideOnWeight', val)}
        />
      </div>
    </div>
  );
}
