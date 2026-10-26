'use client';

import React from 'react';
import Link from 'next/link';
import {
  Badge,
  Button,
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
  PaginationEllipsis,
} from '@/shared/ui';
import {
  Truck,
  Printer,
  ShieldCheck,
  Store,
  AlertTriangle,
} from 'lucide-react';
import { useSuppliesQuery } from '../hooks/use-supplies';
import { SuppliesMetrics } from './SuppliesMetrics';
import { SuppliesFilters, type DatePreset } from './SuppliesFilters';
import { SuppliesTable } from './SuppliesTable';
import { SupplyDetailsModal } from './SupplyDetailsModal';
import { usePrintCart } from '@/features/print';
import type { UmagSupplySummaryItem } from '../types';

export function SuppliesPage() {
  // 1. Default to last 7 days (as requested: 6 past days + today)
  const [dateRange, setDateRange] = React.useState(() => {
    const now = new Date();
    const endOfToday = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
      23,
      59,
      59,
      999
    ).getTime();
    const startOf7DaysAgo = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate() - 6,
      0,
      0,
      0,
      0
    ).getTime();
    return { fromTime: startOf7DaysAgo, toTime: endOfToday };
  });

  const [page, setPage] = React.useState(0);
  const pageSize = 50;
  const [searchQuery, setSearchQuery] = React.useState('');
  const [selectedSupplyId, setSelectedSupplyId] = React.useState<number | null>(null);

  const { totalLabelsCount } = usePrintCart();

  const { data, isLoading, isError, error, refetch } = useSuppliesQuery({
    fromTime: dateRange.fromTime,
    toTime: dateRange.toTime,
    first: page * pageSize,
    pageSize,
  });

  // Client-side search filtering across current list
  const filteredItems: UmagSupplySummaryItem[] = React.useMemo(() => {
    const list = data?.list || [];
    if (!searchQuery.trim()) return list;

    const lower = searchQuery.toLowerCase().trim();
    return list.filter((item) => {
      const idMatch = String(item.id).includes(lower);
      const supplierMatch = (item.supplierName || '').toLowerCase().includes(lower);
      const userMatch = (item.userFirstName || '').toLowerCase().includes(lower);
      return idMatch || supplierMatch || userMatch;
    });
  }, [data?.list, searchQuery]);

  const totalCount = data?.totalCount || 0;
  const totalPages = Math.ceil(totalCount / pageSize);

  const handleRangeChange = (fromTime: number, toTime: number, _preset: DatePreset) => {
    setDateRange({ fromTime, toTime });
    setPage(0);
  };

  const getPageNumbers = () => {
    const pages: (number | 'ellipsis')[] = [];
    const currentPage = page + 1;

    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      if (currentPage > 3) pages.push('ellipsis');
      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);
      for (let i = start; i <= end; i++) pages.push(i);
      if (currentPage < totalPages - 2) pages.push('ellipsis');
      pages.push(totalPages);
    }
    return pages;
  };

  return (
    <div className="space-y-6 pb-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-primary/10 border border-primary/20 text-primary">
              <Truck className="size-5" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              Приемки товаров
            </h1>
            <Badge variant="outline" className="text-xs font-medium gap-1 text-primary border-primary/30">
              <ShieldCheck className="size-3.5" />
              Только Admin
            </Badge>
            <Badge variant="secondary" className="text-xs font-mono hidden sm:inline-flex items-center gap-1">
              <Store className="size-3 text-muted-foreground" />
              #41796
            </Badge>
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            Поступления товаров из системы Umag, контроль цен и отправка ценников на печать
          </p>
        </div>

        {/* Link to Print Queue */}
        <div className="flex items-center gap-2">
          <Link href="/print">
            <Button variant="outline" size="sm" className="h-9 gap-2 text-xs font-medium">
              <Printer className="size-4 text-primary" />
              <span>Очередь печати</span>
              {totalLabelsCount > 0 && (
                <Badge className="bg-primary text-primary-foreground text-[11px] px-1.5 py-0 h-5">
                  {totalLabelsCount}
                </Badge>
              )}
            </Button>
          </Link>
        </div>
      </div>

      {/* KPI Metrics */}
      <SuppliesMetrics data={data} isLoading={isLoading} />

      {/* Filters (Presets, Dates, Search) */}
      <SuppliesFilters
        fromTime={dateRange.fromTime}
        toTime={dateRange.toTime}
        onRangeChange={handleRangeChange}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onRefresh={() => refetch()}
        isLoading={isLoading}
      />

      {/* Error State */}
      {isError && (
        <div className="p-4 rounded-xl border border-destructive/30 bg-destructive/5 text-destructive flex items-center gap-3">
          <AlertTriangle className="size-5 shrink-0" />
          <div className="text-xs">
            <p className="font-semibold">Ошибка загрузки данных приемок</p>
            <p className="text-muted-foreground mt-0.5">
              {error instanceof Error ? error.message : 'Не удалось связаться с сервером'}
            </p>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            className="ml-auto text-xs h-7"
          >
            Повторить
          </Button>
        </div>
      )}

      {/* Table of Invoices */}
      <SuppliesTable
        items={filteredItems}
        isLoading={isLoading}
        onSelectSupply={(id) => setSelectedSupplyId(id)}
      />

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="pt-2">
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  onClick={() => setPage((p) => Math.max(0, p - 1))}
                  disabled={page === 0}
                  className={page === 0 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                />
              </PaginationItem>

              {getPageNumbers().map((pNum, idx) => {
                if (pNum === 'ellipsis') {
                  return (
                    <PaginationItem key={`ell-${idx}`}>
                      <PaginationEllipsis />
                    </PaginationItem>
                  );
                }

                const isActive = page + 1 === pNum;
                return (
                  <PaginationItem key={pNum}>
                    <PaginationLink
                      isActive={isActive}
                      onClick={() => setPage(pNum - 1)}
                      className="cursor-pointer text-xs"
                    >
                      {pNum}
                    </PaginationLink>
                  </PaginationItem>
                );
              })}

              <PaginationItem>
                <PaginationNext
                  onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                  disabled={page >= totalPages - 1}
                  className={page >= totalPages - 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      )}

      {/* Details & Print Modal */}
      <SupplyDetailsModal
        supplyId={selectedSupplyId}
        onClose={() => setSelectedSupplyId(null)}
      />
    </div>
  );
}
