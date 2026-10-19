'use client';

import React from 'react';
import type { ElementInspectorProps } from '../../../model/element-registry-types';
import { CardHeader, CardTitle, CardDescription, Switch } from '@/shared/ui';
import { getElementDefinition } from '../../../model/element-registry';

export function InspectorHeader({ element, onUpdate }: ElementInspectorProps) {
  const definition = getElementDefinition(element.type);
  const Icon = definition.icon;

  return (
    <CardHeader className="p-4 pb-3 bg-blue-50/40 dark:bg-blue-950/20 border-b border-blue-100 dark:border-blue-900/40 flex flex-row items-center justify-between">
      <div className="flex items-center gap-2">
        <div className="p-1.5 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded-lg">
          <Icon className="w-3.5 h-3.5" />
        </div>
        <div>
          <CardTitle className="text-sm font-bold text-slate-900 dark:text-slate-100">
            {element.label}
          </CardTitle>
          <CardDescription className="text-[11px]">
            Параметры шрифта, текста, выравнивания и точного смещения
          </CardDescription>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <span className="text-xs text-slate-600 dark:text-slate-400">Видимость:</span>
        <Switch
          checked={element.visible}
          onCheckedChange={(val) => onUpdate('visible', val)}
        />
      </div>
    </CardHeader>
  );
}
