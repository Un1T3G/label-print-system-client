'use client';

import React from 'react';
import type { ElementInspectorProps } from '../../../model/element-registry-types';
import {
  Input,
  ToggleGroup,
  ToggleGroupItem,
  Slider,
  Label,
  Separator,
} from '@/shared/ui';
import { AlignLeft, AlignCenter, AlignRight } from 'lucide-react';
import { getElementDefinition } from '../../../model/element-registry';

export function InspectorTypographyControls({ element, onUpdate }: ElementInspectorProps) {
  const definition = getElementDefinition(element.type);
  if (!definition.capabilities.hasTypography) return null;

  return (
    <div className="grid grid-cols-2 gap-4 pt-1">
      <Separator className="col-span-2 my-1" />

      {/* Font Size */}
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <Label className="text-xs font-medium">
            Размер шрифта ({element.fontSize || 10} pt):
          </Label>
        </div>
        <div className="flex items-center gap-2">
          <Slider
            min={6}
            max={48}
            step={1}
            value={[element.fontSize || 10]}
            onValueChange={([val]) => onUpdate('fontSize', val)}
            className="flex-1"
          />
          <Input
            type="number"
            min="6"
            max="48"
            value={element.fontSize || 10}
            onChange={(e) => onUpdate('fontSize', Number(e.target.value))}
            className="h-7 w-14 text-xs font-mono text-center px-1"
          />
        </div>
      </div>

      {/* Alignment Buttons */}
      <div className="space-y-1">
        <span className="text-[11px] font-semibold text-slate-700 dark:text-slate-300 block">
          Выравнивание:
        </span>
        <ToggleGroup
          type="single"
          value={element.textAlign || 'left'}
          onValueChange={(val) => {
            if (val) onUpdate('textAlign', val as 'left' | 'center' | 'right');
          }}
          variant="outline"
          size="sm"
          spacing={0}
          className="w-full flex bg-slate-100 dark:bg-slate-800 p-0.5 rounded-lg border border-slate-200 dark:border-slate-700"
        >
          <ToggleGroupItem
            value="left"
            aria-label="По левому краю"
            className="flex-1 h-7 rounded border-0 data-[state=on]:bg-white dark:data-[state=on]:bg-slate-900 data-[state=on]:text-blue-600 dark:data-[state=on]:text-blue-400 data-[state=on]:shadow-xs text-slate-500 hover:text-slate-900 dark:hover:text-white"
            title="По левому краю"
          >
            <AlignLeft className="w-3.5 h-3.5" />
          </ToggleGroupItem>
          <ToggleGroupItem
            value="center"
            aria-label="По центру"
            className="flex-1 h-7 rounded border-0 data-[state=on]:bg-white dark:data-[state=on]:bg-slate-900 data-[state=on]:text-blue-600 dark:data-[state=on]:text-blue-400 data-[state=on]:shadow-xs text-slate-500 hover:text-slate-900 dark:hover:text-white"
            title="По центру"
          >
            <AlignCenter className="w-3.5 h-3.5" />
          </ToggleGroupItem>
          <ToggleGroupItem
            value="right"
            aria-label="По правому краю"
            className="flex-1 h-7 rounded border-0 data-[state=on]:bg-white dark:data-[state=on]:bg-slate-900 data-[state=on]:text-blue-600 dark:data-[state=on]:text-blue-400 data-[state=on]:shadow-xs text-slate-500 hover:text-slate-900 dark:hover:text-white"
            title="По правому краю"
          >
            <AlignRight className="w-3.5 h-3.5" />
          </ToggleGroupItem>
        </ToggleGroup>
      </div>
    </div>
  );
}
