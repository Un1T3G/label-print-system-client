'use client';

import React from 'react';
import type { ElementInspectorProps } from '../../../model/element-registry-types';
import {
  Label,
  Input,
  Slider,
  Switch,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/ui';
import { getElementDefinition } from '../../../model/element-registry';
import { cn } from '@/shared/lib/utils';
import { Box, Square, Minus, FileText } from 'lucide-react';

export function InspectorPluControls({ element, onUpdate }: ElementInspectorProps) {
  const definition = getElementDefinition(element.type);
  if (!definition.capabilities.hasPluSettings) return null;

  const currentStyle = element.pluStyle || 'box';

  const styleOptions: Array<{
    id: 'box' | 'badge' | 'plain' | 'underline';
    label: string;
    icon: React.ComponentType<{ className?: string }>;
  }> = [
    { id: 'box', label: 'В рамке', icon: Box },
    { id: 'badge', label: 'Инверсный бейдж', icon: Square },
    { id: 'plain', label: 'Без рамки', icon: FileText },
    { id: 'underline', label: 'С линией', icon: Minus },
  ];

  return (
    <div className="space-y-4 pt-2 border-t border-slate-100 dark:border-slate-800">
      {/* 1. Стиль оформления рамки PLU */}
      <div className="space-y-1.5">
        <Label className="text-xs font-semibold text-slate-800 dark:text-slate-200">
          Стиль оформления PLU:
        </Label>
        <div className="grid grid-cols-2 gap-2">
          {styleOptions.map((opt) => {
            const Icon = opt.icon;
            const isSelected = currentStyle === opt.id;
            return (
              <button
                key={opt.id}
                type="button"
                onClick={() => onUpdate('pluStyle', opt.id)}
                className={cn(
                  'flex items-center gap-2 p-2 rounded-lg border text-xs font-medium transition text-left cursor-pointer',
                  isSelected
                    ? 'border-blue-600 bg-blue-50/70 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 ring-1 ring-blue-500/50'
                    : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:border-slate-300'
                )}
              >
                <Icon className={cn('size-3.5 shrink-0', isSelected ? 'text-blue-600' : 'text-slate-400')} />
                <span className="truncate">{opt.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. Подпись и её положение */}
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1">
          <Label className="text-[11px] font-semibold text-slate-700 dark:text-slate-300">
            Текст подписи:
          </Label>
          <Input
            type="text"
            value={element.pluLabel ?? 'PLU КОД'}
            onChange={(e) => onUpdate('pluLabel', e.target.value)}
            placeholder="PLU КОД"
            className="h-8 text-xs font-mono font-medium"
          />
        </div>

        <div className="space-y-1">
          <Label className="text-[11px] font-semibold text-slate-700 dark:text-slate-300">
            Положение подписи:
          </Label>
          <Select
            value={element.pluLabelPosition || 'top'}
            onValueChange={(val) =>
              onUpdate('pluLabelPosition', val as 'top' | 'inline' | 'none')
            }
          >
            <SelectTrigger className="w-full h-8 rounded-lg border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs">
              <SelectValue placeholder="Расположение" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="top">Сверху над кодом</SelectItem>
              <SelectItem value="inline">В строку (PLU: 452)</SelectItem>
              <SelectItem value="none">Без подписи (только номер)</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* 3. Размер цифр и межзнаковый интервал */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label className="text-xs font-medium">
            Размер цифр PLU:
          </Label>
          <span className="text-xs font-mono font-bold text-primary">
            {element.fontSize || 14} pt
          </span>
        </div>
        <Slider
          min={10}
          max={32}
          step={1}
          value={[element.fontSize || 14]}
          onValueChange={([val]) => onUpdate('fontSize', val)}
          className="mt-1"
        />
      </div>

      {/* 4. Межзнаковый интервал цифр */}
      <div className="space-y-1">
        <Label className="text-[11px] font-semibold text-slate-700 dark:text-slate-300">
          Интервал между цифрами (разрядка):
        </Label>
        <Select
          value={element.letterSpacing || 'wide'}
          onValueChange={(val) =>
            onUpdate('letterSpacing', val as 'normal' | 'wide' | 'widest')
          }
        >
          <SelectTrigger className="w-full h-8 rounded-lg border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs">
            <SelectValue placeholder="Интервал" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="normal">Стандартный (обычный)</SelectItem>
            <SelectItem value="wide">Широкий (рекомендуется для весов)</SelectItem>
            <SelectItem value="widest">Очень широкий (максимальная читаемость)</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* 5. Условие отображения */}
      <div className="flex items-center justify-between py-1 border-t border-slate-100 dark:border-slate-800/60">
        <div>
          <span className="text-xs font-medium text-slate-800 dark:text-slate-200 block">
            Только для весовых товаров
          </span>
          <span className="text-[10px] text-muted-foreground block">
            Автоматически скрывать этот блок, если товар не весовой
          </span>
        </div>
        <Switch
          checked={element.showOnlyForWeight !== false}
          onCheckedChange={(val) => onUpdate('showOnlyForWeight', val)}
        />
      </div>
    </div>
  );
}
