'use client';

import React from 'react';
import type { ElementInspectorProps } from '../../../model/element-registry-types';
import { Label, Slider, Input, Separator } from '@/shared/ui';
import { getElementDefinition } from '../../../model/element-registry';

export function InspectorQrControls({ element, onUpdate }: ElementInspectorProps) {
  const definition = getElementDefinition(element.type);
  if (!definition.capabilities.hasQrSettings) return null;

  return (
    <div className="space-y-3 pt-2">
      <Separator className="my-1" />
      <div className="space-y-2">
        <Label className="text-xs font-medium">
          Размер QR ({element.qrSize || 36} px):
        </Label>
        <Slider
          min={24}
          max={60}
          step={1}
          value={[element.qrSize || 36]}
          onValueChange={([val]) => onUpdate('qrSize', val)}
          className="mt-2"
        />
      </div>

      <div className="space-y-1">
        <Label className="text-xs font-medium">
          Ссылка или данные для QR:
        </Label>
        <Input
          type="text"
          value={element.qrData || ''}
          onChange={(e) => onUpdate('qrData', e.target.value)}
          placeholder="https://..."
          className="h-8 text-xs"
        />
      </div>
    </div>
  );
}
