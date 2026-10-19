'use client';

import React from 'react';
import type { ElementInspectorProps } from '../../../model/element-registry-types';
import { Input } from '@/shared/ui';
import { getElementDefinition } from '../../../model/element-registry';

export function InspectorGeneralControls({ element, onUpdate }: ElementInspectorProps) {
  const definition = getElementDefinition(element.type);
  const { hasContent, contentPlaceholder } = definition.capabilities;

  return (
    <div className="grid grid-cols-2 gap-3">
      <div className="space-y-1">
        <label className="text-[11px] font-semibold text-slate-700 dark:text-slate-300">
          Название слоя:
        </label>
        <Input
          type="text"
          value={element.label}
          onChange={(e) => onUpdate('label', e.target.value)}
          className="h-8 text-xs"
        />
      </div>

      {hasContent && (
        <div className="space-y-1">
          <label className="text-[11px] font-semibold text-slate-700 dark:text-slate-300">
            Текст содержимого:
          </label>
          <Input
            type="text"
            value={element.content || ''}
            onChange={(e) => onUpdate('content', e.target.value)}
            placeholder={contentPlaceholder || 'Текст'}
            className="h-8 text-xs"
          />
        </div>
      )}
    </div>
  );
}
