'use client';

import React from 'react';
import { Card, CardContent } from '@/shared/ui';
import { FileText, ArrowDownToLine, Tag, TrendingUp } from 'lucide-react';
import type { UmagSuppliesListResponse } from '../types';

interface SuppliesMetricsProps {
  data?: UmagSuppliesListResponse;
  isLoading?: boolean;
}

export function SuppliesMetrics({ data, isLoading }: SuppliesMetricsProps) {
  const totalCount = data?.totalCount ?? 0;
  const arrivalCost = data?.arrivalCost ?? 0;
  const sellingCost = data?.sellingCost ?? 0;
  const marginAmount = sellingCost > arrivalCost ? sellingCost - arrivalCost : 0;
  const marginPercent =
    arrivalCost > 0 ? Math.round((marginAmount / arrivalCost) * 100) : 0;

  const metrics = [
    {
      title: 'Всего накладных',
      value: isLoading ? '...' : totalCount.toLocaleString('ru-RU'),
      subtext: 'за выбранный период',
      icon: FileText,
      color: 'text-blue-500 dark:text-blue-400',
      bg: 'bg-blue-500/10 border-blue-500/20',
    },
    {
      title: 'Сумма закупки (приход)',
      value: isLoading ? '...' : `${Math.round(arrivalCost).toLocaleString('ru-RU')} сум`,
      subtext: 'себестоимость товара',
      icon: ArrowDownToLine,
      color: 'text-amber-500 dark:text-amber-400',
      bg: 'bg-amber-500/10 border-amber-500/20',
    },
    {
      title: 'Сумма в рознице (продажа)',
      value: isLoading ? '...' : `${Math.round(sellingCost).toLocaleString('ru-RU')} сум`,
      subtext: 'розничная оценка товаров',
      icon: Tag,
      color: 'text-emerald-500 dark:text-emerald-400',
      bg: 'bg-emerald-500/10 border-emerald-500/20',
    },
    {
      title: 'Торговая наценка',
      value: isLoading ? '...' : `+${Math.round(marginAmount).toLocaleString('ru-RU')} сум`,
      subtext: isLoading ? '' : `Наценка: +${marginPercent}%`,
      icon: TrendingUp,
      color: 'text-violet-500 dark:text-violet-400',
      bg: 'bg-violet-500/10 border-violet-500/20',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {metrics.map((item, idx) => {
        const Icon = item.icon;
        return (
          <Card key={idx} className="border-border/60 shadow-xs hover:shadow-md transition-shadow">
            <CardContent className="p-4 sm:p-5 flex items-start justify-between gap-3">
              <div className="space-y-1">
                <span className="text-xs font-medium text-muted-foreground block">
                  {item.title}
                </span>
                <span className="text-xl sm:text-2xl font-bold tracking-tight text-foreground block">
                  {item.value}
                </span>
                {item.subtext && (
                  <span className="text-xs text-muted-foreground block">
                    {item.subtext}
                  </span>
                )}
              </div>
              <div className={`p-2.5 rounded-xl border shrink-0 ${item.bg}`}>
                <Icon className={`size-5 ${item.color}`} />
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
