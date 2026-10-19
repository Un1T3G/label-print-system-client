'use client';

import React from 'react';
import type { ElementInspectorProps } from '../../../model/element-registry-types';
import { Button, Slider } from '@/shared/ui';
import { Move } from 'lucide-react';

export function InspectorOffsetControls({ element, onUpdate }: ElementInspectorProps) {
  const hasOffset = Boolean(element.offsetX || element.offsetY);

  return (
    <div className="p-3.5 bg-muted/40 rounded-xl border border-border space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-foreground flex items-center gap-1.5">
          <Move className="w-3.5 h-3.5 text-primary" />
          Точное позиционирование и смещение (X / Y)
        </span>

        {hasOffset && (
          <Button
            type="button"
            variant="link"
            size="sm"
            onClick={() => {
              onUpdate('offsetX', 0);
              onUpdate('offsetY', 0);
            }}
            className="h-auto p-0 text-[11px] text-primary hover:underline font-medium"
          >
            Сбросить в 0
          </Button>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        {/* Offset Y */}
        <div className="space-y-2">
          <div className="flex justify-between items-center text-[11px]">
            <span className="text-muted-foreground font-medium">
              Смещение Y ({element.offsetY || 0} px):
            </span>
            <span className="font-mono text-xs font-bold text-foreground">
              {element.offsetY || 0}px
            </span>
          </div>
          <Slider
            min={-25}
            max={35}
            step={1}
            value={[element.offsetY || 0]}
            onValueChange={([val]) => onUpdate('offsetY', val)}
          />
        </div>

        {/* Offset X */}
        <div className="space-y-2">
          <div className="flex justify-between items-center text-[11px]">
            <span className="text-muted-foreground font-medium">
              Смещение X ({element.offsetX || 0} px):
            </span>
            <span className="font-mono text-xs font-bold text-foreground">
              {element.offsetX || 0}px
            </span>
          </div>
          <Slider
            min={-35}
            max={35}
            step={1}
            value={[element.offsetX || 0]}
            onValueChange={([val]) => onUpdate('offsetX', val)}
          />
        </div>
      </div>
      <p className="text-[10px] text-muted-foreground">
        💡 Подсказка: Вы также можете перетаскивать элемент мышкой прямо на интерактивном превью справа!
      </p>
    </div>
  );
}
