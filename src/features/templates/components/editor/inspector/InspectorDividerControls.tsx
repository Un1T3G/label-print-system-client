'use client';

import React from 'react';
import type { ElementInspectorProps } from '../../../model/element-registry-types';
import { Label, Slider, Separator } from '@/shared/ui';
import { getElementDefinition } from '../../../model/element-registry';

export function InspectorDividerControls({ element, onUpdate }: ElementInspectorProps) {
  const definition = getElementDefinition(element.type);
  if (!definition.capabilities.hasDividerSettings) return null;

  return (
    <div className="space-y-3 pt-2">
      <Separator className="my-1" />
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label className="text-xs font-medium">
            Толщина линии ({element.borderWidth || 1} px):
          </Label>
          <Slider
            min={1}
            max={8}
            step={1}
            value={[element.borderWidth || 1]}
            onValueChange={([val]) => onUpdate('borderWidth', val)}
            className="mt-2"
          />
        </div>

        <div className="space-y-2">
          <Label className="text-xs font-medium">
            Отступ сверху/снизу ({element.paddingY || 1} px):
          </Label>
          <Slider
            min={0}
            max={12}
            step={1}
            value={[element.paddingY || 1]}
            onValueChange={([val]) => onUpdate('paddingY', val)}
            className="mt-2"
          />
        </div>
      </div>
    </div>
  );
}
