'use client';

import React from 'react';
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/shared/ui';
import { Sparkles } from 'lucide-react';
import { LAYOUT_PRESETS } from '../../lib/label-elements';

interface PresetsTabProps {
  onApplyPreset: (presetId: string) => void;
}

export function PresetsTab({ onApplyPreset }: PresetsTabProps) {
  return (
    <Card className="border-slate-200 dark:border-slate-800 shadow-xs bg-white dark:bg-slate-900">
      <CardHeader className="p-5 pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-amber-500" />
          Готовые стили и шаблоны макетов
        </CardTitle>
        <CardDescription className="text-xs">
          Выберите подходящий стиль ценника в 1 клик. Все элементы можно будет дополнительно настроить
        </CardDescription>
      </CardHeader>
      <CardContent className="p-5 pt-0 space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          {LAYOUT_PRESETS.map((preset) => (
            <div
              key={preset.id}
              className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-blue-300 dark:hover:border-blue-700 hover:bg-blue-50/20 dark:hover:bg-blue-950/20 transition-all flex flex-col justify-between space-y-3 group"
            >
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-slate-900 dark:text-white text-sm group-hover:text-blue-700 dark:group-hover:text-blue-400 transition">
                    {preset.name}
                  </h4>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                  {preset.description}
                </p>
              </div>

              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => onApplyPreset(preset.id)}
                className="w-full text-xs font-semibold bg-white dark:bg-slate-800 hover:bg-blue-600 hover:text-white transition"
              >
                Применить этот макет
              </Button>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
