'use client';

import React from 'react';
import type { ElementInspectorProps } from '../../../model/element-registry-types';
import { Input } from '@/shared/ui';
import { getElementDefinition } from '../../../model/element-registry';

export function InspectorPrefixSuffixControls({ element, onUpdate }: ElementInspectorProps) {
  const definition = getElementDefinition(element.type);
  if (!definition.capabilities.hasPrefixSuffix) return null;

  return (
    <div className="grid grid-cols-2 gap-3">
      <div className="space-y-1">
        <label className="text-[11px] font-semibold text-slate-700 dark:text-slate-300">
          Префикс (перед текстом):
        </label>
        <Input
          type="text"
          value={element.prefix || ''}
          onChange={(e) => onUpdate('prefix', e.target.value)}
          placeholder="Напр. «Арт: », «Дата: »"
          className="h-8 text-xs"
        />
      </div>
      <div className="space-y-1">
        <label className="text-[11px] font-semibold text-slate-700 dark:text-slate-300">
          Суффикс (после текста):
        </label>
        <Input
          type="text"
          value={element.suffix || ''}
          onChange={(e) => onUpdate('suffix', e.target.value)}
          placeholder="Напр. « сум», « шт.»"
          className="h-8 text-xs"
        />
      </div>
    </div>
  );
}
