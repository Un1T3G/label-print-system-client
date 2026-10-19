'use client';

import React from 'react';
import type { ElementInspectorProps } from '../../../model/element-registry-types';
import { Label, Input, Switch, Separator } from '@/shared/ui';
import { getElementDefinition } from '../../../model/element-registry';

export function InspectorPriceControls({ element, onUpdate }: ElementInspectorProps) {
  const definition = getElementDefinition(element.type);
  if (!definition.capabilities.hasPriceSettings) return null;

  return (
    <div className="space-y-3 pt-2">
      <Separator className="my-1" />
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1">
          <Label className="text-xs font-medium">
            Валюта ценника:
          </Label>
          <Input
            type="text"
            value={element.currencySymbol || 'сум'}
            onChange={(e) => onUpdate('currencySymbol', e.target.value)}
            placeholder="сум"
            className="h-8 text-xs font-bold"
          />
        </div>

        <div className="flex items-center justify-between pt-4">
          <span className="text-xs text-muted-foreground font-medium">
            Выводить «за шт./кг»:
          </span>
          <Switch
            checked={element.showMeasure !== false}
            onCheckedChange={(val) => onUpdate('showMeasure', val)}
          />
        </div>
      </div>
    </div>
  );
}
