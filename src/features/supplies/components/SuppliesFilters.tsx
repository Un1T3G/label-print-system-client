'use client';

import React from 'react';
import { Button, Input } from '@/shared/ui';
import { Calendar, RefreshCw, Search, X } from 'lucide-react';

export type DatePreset = 'today' | 'yesterday' | '7days' | '30days' | 'thisMonth' | 'custom';

interface SuppliesFiltersProps {
  fromTime: number;
  toTime: number;
  onRangeChange: (fromTime: number, toTime: number, preset: DatePreset) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onRefresh: () => void;
  isLoading?: boolean;
}

function formatDateForInput(timestamp: number): string {
  const d = new Date(timestamp);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function parseDateInput(value: string, endOfDay = false): number {
  const [year, month, day] = value.split('-').map(Number);
  const d = new Date(year, month - 1, day);
  if (endOfDay) {
    d.setHours(23, 59, 59, 999);
  } else {
    d.setHours(0, 0, 0, 0);
  }
  return d.getTime();
}

export function SuppliesFilters({
  fromTime,
  toTime,
  onRangeChange,
  searchQuery,
  onSearchChange,
  onRefresh,
  isLoading,
}: SuppliesFiltersProps) {
  const [activePreset, setActivePreset] = React.useState<DatePreset>('7days');

  const applyPreset = (preset: DatePreset) => {
    const now = new Date();
    const endOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999).getTime();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0).getTime();

    let newFrom = fromTime;
    let newTo = endOfToday;

    if (preset === 'today') {
      newFrom = startOfToday;
      newTo = endOfToday;
    } else if (preset === 'yesterday') {
      const startOfYesterday = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1, 0, 0, 0, 0).getTime();
      const endOfYesterday = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1, 23, 59, 59, 999).getTime();
      newFrom = startOfYesterday;
      newTo = endOfYesterday;
    } else if (preset === '7days') {
      // 6 full past days + today = 7 days
      const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 6, 0, 0, 0, 0);
      newFrom = d.getTime();
      newTo = endOfToday;
    } else if (preset === '30days') {
      const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 29, 0, 0, 0, 0);
      newFrom = d.getTime();
      newTo = endOfToday;
    } else if (preset === 'thisMonth') {
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0).getTime();
      newFrom = startOfMonth;
      newTo = endOfToday;
    }

    setActivePreset(preset);
    onRangeChange(newFrom, newTo, preset);
  };

  const handleCustomStartDate = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    if (!val) return;
    setActivePreset('custom');
    const newFrom = parseDateInput(val, false);
    onRangeChange(newFrom, toTime, 'custom');
  };

  const handleCustomEndDate = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    if (!val) return;
    setActivePreset('custom');
    const newTo = parseDateInput(val, true);
    onRangeChange(fromTime, newTo, 'custom');
  };

  return (
    <div className="space-y-3.5 bg-card border border-border/70 rounded-xl p-4 shadow-xs">
      {/* Top row: Presets + Refresh */}
      <div className="flex flex-wrap items-center justify-between gap-2.5">
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-xs font-medium text-muted-foreground mr-1 flex items-center gap-1">
            <Calendar className="size-3.5" />
            Период:
          </span>
          <Button
            type="button"
            size="sm"
            variant={activePreset === '7days' ? 'default' : 'outline'}
            className="h-8 text-xs font-medium"
            onClick={() => applyPreset('7days')}
          >
            7 дней
          </Button>
          <Button
            type="button"
            size="sm"
            variant={activePreset === 'today' ? 'default' : 'outline'}
            className="h-8 text-xs font-medium"
            onClick={() => applyPreset('today')}
          >
            Сегодня
          </Button>
          <Button
            type="button"
            size="sm"
            variant={activePreset === 'yesterday' ? 'default' : 'outline'}
            className="h-8 text-xs font-medium"
            onClick={() => applyPreset('yesterday')}
          >
            Вчера
          </Button>
          <Button
            type="button"
            size="sm"
            variant={activePreset === '30days' ? 'default' : 'outline'}
            className="h-8 text-xs font-medium"
            onClick={() => applyPreset('30days')}
          >
            30 дней
          </Button>
          <Button
            type="button"
            size="sm"
            variant={activePreset === 'thisMonth' ? 'default' : 'outline'}
            className="h-8 text-xs font-medium"
            onClick={() => applyPreset('thisMonth')}
          >
            Этот месяц
          </Button>
        </div>

        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={onRefresh}
          disabled={isLoading}
          className="h-8 text-xs gap-1.5 shrink-0"
        >
          <RefreshCw className={`size-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          <span className="hidden sm:inline">Обновить</span>
        </Button>
      </div>

      {/* Bottom row: Exact date pickers & Search box */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 pt-1 border-t border-border/50">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 bg-muted/30 px-2.5 py-1 rounded-md border border-input">
            <span className="text-xs text-muted-foreground whitespace-nowrap">С:</span>
            <input
              type="date"
              value={formatDateForInput(fromTime)}
              onChange={handleCustomStartDate}
              className="bg-transparent text-xs text-foreground focus:outline-hidden cursor-pointer"
            />
          </div>
          <div className="flex items-center gap-1.5 bg-muted/30 px-2.5 py-1 rounded-md border border-input">
            <span className="text-xs text-muted-foreground whitespace-nowrap">По:</span>
            <input
              type="date"
              value={formatDateForInput(toTime)}
              onChange={handleCustomEndDate}
              className="bg-transparent text-xs text-foreground focus:outline-hidden cursor-pointer"
            />
          </div>
        </div>

        {/* Search input */}
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground pointer-events-none" />
          <Input
            placeholder="Поиск по поставщику или № накладной..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="h-8 pl-8 pr-8 text-xs"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => onSearchChange('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X className="size-3.5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
