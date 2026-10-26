'use client';

import React from 'react';
import type { PrintTemplateConfig } from '../../types';
import {
  Input,
  Label,
  Switch,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  ToggleGroup,
  ToggleGroupItem,
} from '@/shared/ui';
import { Maximize2 } from 'lucide-react';
import { PRESET_SIZES } from '../../constants/editor-presets';

interface GeometryTabProps {
  name: string;
  onNameChange: (val: string) => void;
  widthMm: number;
  onWidthMmChange: (val: number) => void;
  heightMm: number;
  onHeightMmChange: (val: number) => void;
  config: PrintTemplateConfig;
  onConfigChange: <K extends keyof PrintTemplateConfig>(key: K, value: PrintTemplateConfig[K]) => void;
  onApplyPresetSize: (w: number, h: number) => void;
}

export function GeometryTab({
  name,
  onNameChange,
  widthMm,
  onWidthMmChange,
  heightMm,
  onHeightMmChange,
  config,
  onConfigChange,
  onApplyPresetSize,
}: GeometryTabProps) {
  return (
    <Card className="shadow-xs">
      <CardHeader className="p-5 pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <Maximize2 className="w-4 h-4 text-primary" />
          Геометрия и стиль ценника
        </CardTitle>
        <CardDescription className="text-xs">
          Физические размеры термоэтикетки и декоративные границы
        </CardDescription>
      </CardHeader>
      <CardContent className="p-5 pt-0 space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="template-name" className="text-xs font-semibold">
            Название шаблона
          </Label>
          <Input
            id="template-name"
            type="text"
            value={name}
            onChange={(e) => onNameChange(e.target.value)}
            placeholder="Например: Стандартный 58х40мм"
            required
          />
        </div>

        {/* Target Type Selector for Auto-routing */}
        <div className="space-y-2 p-3 bg-muted/40 rounded-lg border border-border">
          <Label className="text-xs font-semibold block">
            Назначение шаблона (для автовыбора при печати):
          </Label>
          <ToggleGroup
            type="single"
            value={config.targetType || 'all'}
            onValueChange={(val) => {
              if (val) onConfigChange('targetType', val as 'piece' | 'weight' | 'all');
            }}
            size="sm"
            variant="outline"
            className="flex flex-wrap gap-2 justify-start"
          >
            <ToggleGroupItem
              value="piece"
              className="px-3 py-1.5 text-xs font-medium data-[state=on]:bg-blue-600 data-[state=on]:text-white"
            >
              🏷️ Штучные (шт)
            </ToggleGroupItem>
            <ToggleGroupItem
              value="weight"
              className="px-3 py-1.5 text-xs font-medium data-[state=on]:bg-emerald-600 data-[state=on]:text-white"
            >
              ⚖️ Весовые (кг)
            </ToggleGroupItem>
            <ToggleGroupItem
              value="all"
              className="px-3 py-1.5 text-xs font-medium data-[state=on]:bg-primary data-[state=on]:text-primary-foreground"
            >
              🌐 Универсальный
            </ToggleGroupItem>
          </ToggleGroup>
          <p className="text-[11px] text-muted-foreground leading-relaxed">
            Система будет автоматически выбирать этот шаблон при печати товаров с соответствующей единицей измерения.
          </p>

          <div className="pt-2 border-t border-border/60 flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="default-piece" className="text-xs cursor-pointer">
                Основной шаблон для штучных товаров (шт)
              </Label>
              <Switch
                id="default-piece"
                checked={Boolean(config.isDefaultPiece)}
                onCheckedChange={(checked) => onConfigChange('isDefaultPiece', checked)}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="default-weight" className="text-xs cursor-pointer">
                Основной шаблон для весовых товаров (кг)
              </Label>
              <Switch
                id="default-weight"
                checked={Boolean(config.isDefaultWeight)}
                onCheckedChange={(checked) => onConfigChange('isDefaultWeight', checked)}
              />
            </div>
          </div>
        </div>


        {/* Size presets */}
        <div className="space-y-1.5">
          <Label className="text-xs font-semibold block">
            Быстрый выбор стандартного размера:
          </Label>
          <ToggleGroup
            type="single"
            value={`${widthMm}x${heightMm}`}
            onValueChange={(val) => {
              if (val) {
                const [w, h] = val.split('x').map(Number);
                onApplyPresetSize(w, h);
              }
            }}
            size="sm"
            variant="outline"
            className="flex flex-wrap gap-1.5 justify-start"
          >
            {PRESET_SIZES.map((preset) => (
              <ToggleGroupItem
                key={preset.label}
                value={`${preset.w}x${preset.h}`}
                className="px-2.5 py-1 text-xs font-mono font-medium data-[state=on]:bg-primary data-[state=on]:text-primary-foreground"
              >
                {preset.label}
              </ToggleGroupItem>
            ))}
          </ToggleGroup>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="width-mm" className="text-xs font-semibold">
              Ширина (мм)
            </Label>
            <Input
              id="width-mm"
              type="number"
              min="20"
              max="120"
              value={widthMm}
              onChange={(e) => onWidthMmChange(Number(e.target.value))}
              required
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="height-mm" className="text-xs font-semibold">
              Высота (мм)
            </Label>
            <Input
              id="height-mm"
              type="number"
              min="15"
              max="120"
              value={heightMm}
              onChange={(e) => onHeightMmChange(Number(e.target.value))}
              required
            />
          </div>
        </div>

        {/* Padding / Margins inside label */}
        <div className="p-3.5 bg-muted/40 rounded-xl border border-border space-y-3">
          <div>
            <span className="text-xs font-semibold text-foreground block">
              Внутренние отступы ценника (поля)
            </span>
            <span className="text-[11px] text-muted-foreground">
              Настройте отступы от краев этикетки, если принтер печатает слишком близко или далеко от края
            </span>
          </div>

          <div className="grid grid-cols-2 gap-4 pt-1">
            <div className="space-y-1">
              <div className="flex justify-between items-center text-xs">
                <span className="text-[11px] font-medium text-muted-foreground">По бокам (X):</span>
                <span className="font-mono text-xs font-bold text-primary">
                  {config.paddingX ?? 2.5} мм
                </span>
              </div>
              <Input
                type="number"
                min="0"
                max="10"
                step="0.5"
                value={config.paddingX ?? 2.5}
                onChange={(e) => onConfigChange('paddingX', Number(e.target.value))}
                className="h-8 text-xs font-mono"
              />
            </div>

            <div className="space-y-1">
              <div className="flex justify-between items-center text-xs">
                <span className="text-[11px] font-medium text-muted-foreground">Сверху/снизу (Y):</span>
                <span className="font-mono text-xs font-bold text-primary">
                  {config.paddingY ?? 2.0} мм
                </span>
              </div>
              <Input
                type="number"
                min="0"
                max="10"
                step="0.5"
                value={config.paddingY ?? 2.0}
                onChange={(e) => onConfigChange('paddingY', Number(e.target.value))}
                className="h-8 text-xs font-mono"
              />
            </div>
          </div>
        </div>

        {/* Border toggle */}
        <div className="p-3.5 bg-muted/40 rounded-xl border border-border space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs font-semibold text-foreground block">
                Рамка по периметру
              </span>
              <span className="text-[11px] text-muted-foreground">
                Рисовать черную рамку по краю ценника
              </span>
            </div>
            <Switch
              checked={config.showBorder ?? false}
              onCheckedChange={(val) => onConfigChange('showBorder', val)}
            />
          </div>

          {config.showBorder && (
            <div className="pt-2 border-t border-border flex items-center justify-between">
              <span className="text-xs text-muted-foreground">Толщина линии рамки:</span>
              <ToggleGroup
                type="single"
                value={String(config.borderWidth ?? 1)}
                onValueChange={(val) => {
                  if (val) onConfigChange('borderWidth', Number(val));
                }}
                variant="outline"
                size="sm"
                className="gap-1.5"
              >
                {[1, 2, 3].map((w) => (
                  <ToggleGroupItem
                    key={w}
                    value={String(w)}
                    className="w-8 h-7 p-0 text-xs font-bold data-[state=on]:bg-primary data-[state=on]:text-primary-foreground"
                  >
                    {w}px
                  </ToggleGroupItem>
                ))}
              </ToggleGroup>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
