'use client';

import React from 'react';
import type { PrintTemplateConfig } from '../../types';
import {
  Button,
  Input,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  ToggleGroup,
  ToggleGroupItem,
  Slider,
  Label,
} from '@/shared/ui';
import { Printer, RotateCw, Terminal, ExternalLink } from 'lucide-react';
import { cn } from '@/shared/lib/utils';

interface PrinterTabProps {
  config: PrintTemplateConfig;
  onConfigChange: <K extends keyof PrintTemplateConfig>(key: K, value: PrintTemplateConfig[K]) => void;
  onOpenTsplModal: () => void;
}

export function PrinterTab({
  config,
  onConfigChange,
  onOpenTsplModal,
}: PrinterTabProps) {
  return (
    <Card className="border-slate-200 dark:border-slate-800 shadow-xs bg-white dark:bg-slate-900">
      <CardHeader className="p-5 pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <Printer className="w-4 h-4 text-blue-600" />
          Параметры термопринтера (TSPL)
        </CardTitle>
        <CardDescription className="text-xs">
          Тонкая настройка аппаратных команд печати этикеток
        </CardDescription>
      </CardHeader>
      <CardContent className="p-5 pt-0 space-y-4">
        {/* Density (Плотность) */}
        <div className="space-y-2 p-3.5 bg-muted/40 rounded-xl border border-border">
          <div className="flex justify-between items-center text-xs">
            <Label className="text-xs font-semibold">
              Плотность нагрева головки (DENSITY):
            </Label>
            <span className="font-mono font-bold bg-background px-2 py-0.5 rounded border border-border text-primary">
              {config.density ?? 8} / 15
            </span>
          </div>
          <Slider
            min={1}
            max={15}
            step={1}
            value={[config.density ?? 8]}
            onValueChange={([val]) => onConfigChange('density', val)}
            className="mt-3"
          />
          <div className="flex justify-between text-[10px] text-muted-foreground mt-1">
            <span>1 (Светлее)</span>
            <span>8 (Стандарт)</span>
            <span>15 (Макс. чернота)</span>
          </div>
        </div>

        {/* Speed (Скорость) */}
        <div className="space-y-1.5 p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200/80 dark:border-slate-700">
          <div className="flex justify-between items-center text-xs">
            <span className="font-bold text-slate-900 dark:text-slate-100">
              Скорость протяжки (SPEED):
            </span>
            <span className="font-mono font-bold bg-white dark:bg-slate-800 px-2 py-0.5 rounded border border-slate-200 dark:border-slate-700 text-blue-700 dark:text-blue-400">
              {config.speed ?? 4} дюйм/сек
            </span>
          </div>
          <ToggleGroup
            type="single"
            value={String(config.speed ?? 4)}
            onValueChange={(val) => {
              if (val) onConfigChange('speed', Number(val));
            }}
            variant="outline"
            size="sm"
            className="w-full flex gap-2 mt-2"
          >
            {[2, 3, 4, 5, 6].map((spd) => (
              <ToggleGroupItem
                key={spd}
                value={String(spd)}
                className="flex-1 py-1.5 h-auto text-xs font-bold rounded-lg border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 data-[state=on]:bg-blue-600 data-[state=on]:text-white data-[state=on]:border-blue-600"
              >
                {spd}&quot;
              </ToggleGroupItem>
            ))}
          </ToggleGroup>
        </div>

        {/* Label Gap & Print Direction */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              Зазор между этикетками (GAP мм)
            </label>
            <Input
              type="number"
              min="0"
              max="10"
              step="0.5"
              value={config.gapMm ?? 2}
              onChange={(e) => onConfigChange('gapMm', Number(e.target.value))}
              className="h-9 text-xs"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              Направление (DIRECTION)
            </label>
            <Button
              type="button"
              variant="outline"
              onClick={() => onConfigChange('direction', config.direction === 1 ? 0 : 1)}
              className={cn(
                'w-full h-9 flex items-center justify-center gap-1.5 rounded-lg border text-xs font-semibold transition',
                config.direction === 1
                  ? 'bg-amber-50 dark:bg-amber-950/40 border-amber-300 dark:border-amber-700 text-amber-800 dark:text-amber-200'
                  : 'bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200'
              )}
            >
              <RotateCw className="w-3.5 h-3.5" />
              {config.direction === 1 ? 'Поворот 180°' : '0° Прямое'}
            </Button>
          </div>
        </div>

        {/* TSPL Live Preview endpoint card */}
        <div className="p-3.5 bg-slate-900 text-slate-100 rounded-xl border border-slate-700 space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-white flex items-center gap-1.5">
              <Terminal className="w-3.5 h-3.5 text-blue-400" />
              Сгенерированные команды TSPL
            </span>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onOpenTsplModal}
              className="h-7 text-[11px] bg-slate-800 border-slate-700 hover:bg-slate-700 text-white font-medium gap-1"
            >
              <ExternalLink className="w-3 h-3" />
              Посмотреть TSPL (9100)
            </Button>
          </div>
          <p className="text-[11px] text-slate-400">
            Сервис термопечати на порту 9100 генерирует чистые TSPL инструкции для принтера. Вы можете просмотреть или скачать их в реальном времени.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
