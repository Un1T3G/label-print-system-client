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
            Тип штрихкода:
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

        <div className="space-y-2">
          <Label className="text-xs font-medium">
            Высота штрихов ({element.barcodeHeight || 45} pt):
          </Label>
          <Slider
            min={20}
            max={70}
            step={1}
            value={[element.barcodeHeight || 45]}
            onValueChange={([val]) => onUpdate('barcodeHeight', val)}
            className="mt-2"
          />
        </div>
      </div>

      <div className="flex items-center justify-between py-1">
        <span className="text-xs text-muted-foreground font-medium">
          Печатать читаемые цифры под штрихкодом
        </span>
        <Switch
          checked={element.showBarcodeDigits !== false}
          onCheckedChange={(val) => onUpdate('showBarcodeDigits', val)}
        />
      </div>
    </div>
  );
}
