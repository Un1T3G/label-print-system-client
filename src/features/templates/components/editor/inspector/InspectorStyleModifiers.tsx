'use client';

import React from 'react';
import type { ElementInspectorProps } from '../../../model/element-registry-types';
import { ToggleGroup, ToggleGroupItem } from '@/shared/ui';
import { getElementDefinition } from '../../../model/element-registry';

export function InspectorStyleModifiers({ element, onUpdate }: ElementInspectorProps) {
  const definition = getElementDefinition(element.type);
  if (!definition.capabilities.hasStyleModifiers) return null;

  return (
    <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-slate-100 dark:border-slate-800">
      <span className="text-[11px] font-semibold text-slate-600 dark:text-slate-400 mr-1">
        Стиль:
      </span>

      {/* Font weight ToggleGroup */}
      <ToggleGroup
        type="single"
        value={element.fontWeight || 'normal'}
        onValueChange={(val) => {
          if (val) onUpdate('fontWeight', val as 'normal' | 'bold' | 'black');
        }}
        size="sm"
        variant="outline"
        className="gap-1"
      >
        <ToggleGroupItem
          value="normal"
          className="h-6 px-2 text-[11px] rounded-md border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 data-[state=on]:bg-blue-600 data-[state=on]:text-white data-[state=on]:border-blue-600 data-[state=on]:font-bold"
        >
          Обычный
        </ToggleGroupItem>
        <ToggleGroupItem
          value="bold"
          className="h-6 px-2 text-[11px] font-bold rounded-md border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 data-[state=on]:bg-blue-600 data-[state=on]:text-white data-[state=on]:border-blue-600"
        >
          Жирный
        </ToggleGroupItem>
        <ToggleGroupItem
          value="black"
          className="h-6 px-2 text-[11px] font-black rounded-md border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 data-[state=on]:bg-blue-600 data-[state=on]:text-white data-[state=on]:border-blue-600"
        >
          Black
        </ToggleGroupItem>
      </ToggleGroup>

      {/* Modifiers ToggleGroup */}
      <ToggleGroup
        type="multiple"
        value={[
          element.textTransform === 'uppercase' ? 'uppercase' : '',
          element.inverted ? 'inverted' : '',
          element.borderBottom ? 'borderBottom' : '',
        ].filter(Boolean)}
        onValueChange={(vals) => {
          onUpdate('textTransform', vals.includes('uppercase') ? 'uppercase' : 'none');
          onUpdate('inverted', vals.includes('inverted'));
          onUpdate('borderBottom', vals.includes('borderBottom'));
        }}
        size="sm"
        variant="outline"
        className="gap-1"
      >
        <ToggleGroupItem
          value="uppercase"
          className="h-6 px-2 text-[11px] font-mono rounded-md border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 data-[state=on]:bg-blue-600 data-[state=on]:text-white data-[state=on]:border-blue-600 data-[state=on]:font-bold"
        >
          AA (ЗАГЛАВНЫЕ)
        </ToggleGroupItem>
        <ToggleGroupItem
          value="inverted"
          className="h-6 px-2 text-[11px] rounded-md border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 data-[state=on]:bg-black data-[state=on]:text-white data-[state=on]:border-black data-[state=on]:font-bold"
        >
          {element.inverted ? '■ Инверсия (Ч/Б)' : '□ Обычный фон'}
        </ToggleGroupItem>
        <ToggleGroupItem
          value="borderBottom"
          className="h-6 px-2 text-[11px] underline rounded-md border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 data-[state=on]:bg-blue-50 dark:data-[state=on]:bg-blue-950/60 data-[state=on]:text-blue-700 dark:data-[state=on]:text-blue-300 data-[state=on]:border-blue-400 data-[state=on]:font-bold"
        >
          Линия снизу
        </ToggleGroupItem>
      </ToggleGroup>
    </div>
  );
}
