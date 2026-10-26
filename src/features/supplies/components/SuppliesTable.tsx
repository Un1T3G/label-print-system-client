'use client';

import React from 'react';
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
  Button,
  Badge,
  Skeleton,
} from '@/shared/ui';
import { Eye, Truck, User, Calendar, CreditCard, ChevronRight } from 'lucide-react';
import type { UmagSupplySummaryItem } from '../types';

interface SuppliesTableProps {
  items: UmagSupplySummaryItem[];
  isLoading?: boolean;
  onSelectSupply: (id: number) => void;
}

export function SuppliesTable({
  items,
  isLoading,
  onSelectSupply,
}: SuppliesTableProps) {
  const formatDate = (timestamp: number) => {
    if (!timestamp) return '—';
    const d = new Date(timestamp);
    return d.toLocaleString('ru-RU', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="bg-card border border-border rounded-xl shadow-xs overflow-hidden">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader className="bg-muted/30">
            <TableRow className="hover:bg-transparent">
              <TableHead className="w-28 text-xs font-semibold">№ Документа</TableHead>
              <TableHead className="text-xs font-semibold">Дата и время</TableHead>
              <TableHead className="text-xs font-semibold">Поставщик</TableHead>
              <TableHead className="text-xs font-semibold text-right">Сумма закупки</TableHead>
              <TableHead className="text-xs font-semibold text-right">В рознице</TableHead>
              <TableHead className="text-xs font-semibold">Принял / Касса</TableHead>
              <TableHead className="w-28 text-xs font-semibold text-center">Действие</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 8 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-28" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-40" /></TableCell>
                  <TableCell className="text-right"><Skeleton className="h-4 w-24 ml-auto" /></TableCell>
                  <TableCell className="text-right"><Skeleton className="h-4 w-24 ml-auto" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-28" /></TableCell>
                  <TableCell className="text-center"><Skeleton className="h-8 w-20 mx-auto" /></TableCell>
                </TableRow>
              ))
            ) : items.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="h-48 text-center">
                  <div className="flex flex-col items-center justify-center gap-2 text-muted-foreground">
                    <div className="p-3 rounded-full bg-muted">
                      <Truck className="size-6 text-muted-foreground/60" />
                    </div>
                    <span className="text-sm font-medium text-foreground">Приемок не найдено</span>
                    <span className="text-xs text-muted-foreground max-w-sm">
                      За выбранный период или по заданным критериям поиска документы поступления отсутствуют.
                    </span>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              items.map((supply) => {
                const arrival = Math.round(supply.arrivalCost || supply.amount || 0);
                const selling = Math.round(supply.sellingCost || 0);
                const margin = selling > arrival ? selling - arrival : 0;

                return (
                  <TableRow
                    key={supply.id}
                    className="hover:bg-muted/40 cursor-pointer transition-colors group"
                    onClick={() => onSelectSupply(supply.id)}
                  >
                    {/* Document ID */}
                    <TableCell className="py-3 font-mono font-medium text-xs text-foreground">
                      <div className="flex items-center gap-1.5">
                        <span className="text-primary font-semibold">#{supply.id}</span>
                        {supply.isOcr && (
                          <Badge variant="secondary" className="text-[10px] px-1 py-0 h-4">
                            OCR
                          </Badge>
                        )}
                      </div>
                    </TableCell>

                    {/* Date */}
                    <TableCell className="py-3 text-xs text-muted-foreground whitespace-nowrap">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="size-3 text-muted-foreground/70" />
                        <span>{formatDate(supply.docTime)}</span>
                      </div>
                    </TableCell>

                    {/* Supplier */}
                    <TableCell className="py-3 text-xs font-medium text-foreground max-w-[240px]">
                      <div className="truncate" title={supply.supplierName}>
                        {supply.supplierName || 'Поставщик не указан'}
                      </div>
                    </TableCell>

                    {/* Arrival Cost */}
                    <TableCell className="py-3 text-xs text-right font-mono font-medium text-amber-600 dark:text-amber-400 whitespace-nowrap">
                      {arrival.toLocaleString('ru-RU')} сум
                    </TableCell>

                    {/* Retail Selling Cost */}
                    <TableCell className="py-3 text-xs text-right whitespace-nowrap">
                      <div className="font-mono font-bold text-emerald-600 dark:text-emerald-400">
                        {selling.toLocaleString('ru-RU')} сум
                      </div>
                      {margin > 0 && (
                        <div className="text-[10px] text-muted-foreground font-mono">
                          +{margin.toLocaleString('ru-RU')}
                        </div>
                      )}
                    </TableCell>

                    {/* User / Account */}
                    <TableCell className="py-3 text-xs text-muted-foreground whitespace-nowrap">
                      <div className="flex flex-col gap-0.5">
                        <span className="flex items-center gap-1 text-foreground font-medium">
                          <User className="size-3 text-muted-foreground/70" />
                          {supply.userFirstName || '—'}
                        </span>
                        {supply.account && (
                          <span className="flex items-center gap-1 text-[11px] text-muted-foreground">
                            <CreditCard className="size-3 text-muted-foreground/70" />
                            {supply.account}
                          </span>
                        )}
                      </div>
                    </TableCell>

                    {/* Action */}
                    <TableCell className="py-3 text-center" onClick={(e) => e.stopPropagation()}>
                      <Button
                        type="button"
                        size="sm"
                        variant="ghost"
                        className="h-8 px-2.5 text-xs gap-1 text-primary hover:text-primary group-hover:bg-primary/10"
                        onClick={() => onSelectSupply(supply.id)}
                      >
                        <Eye className="size-3.5" />
                        <span>Состав</span>
                        <ChevronRight className="size-3.5 ml-0.5 opacity-60" />
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
