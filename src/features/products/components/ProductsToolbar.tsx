'use client';

import React from 'react';
import {
  Card,
  CardContent,
  Input,
  Button,
  ToggleGroup,
  ToggleGroupItem,
} from '@/shared/ui';
import { Search, ScanBarcode, X, LayoutGrid, Package, Scale } from 'lucide-react';
import { BarcodeScannerPanel } from './BarcodeScannerPanel';

interface ProductsToolbarProps {
  searchTerm: string;
  onSearchChange: (val: string) => void;
  measureFilter: 0 | 1 | undefined;
  onMeasureChange: (val: 0 | 1 | undefined) => void;
  isScannerOpen?: boolean;
  onToggleScanner?: () => void;
  onCloseScanner?: () => void;
  onScanBarcode?: (barcode: string) => void;
  /** @deprecated use onToggleScanner instead */
  onOpenScanner?: () => void;
}

export function ProductsToolbar({
  searchTerm,
  onSearchChange,
  measureFilter,
  onMeasureChange,
  isScannerOpen,
  onToggleScanner,
  onCloseScanner,
  onScanBarcode,
  onOpenScanner,
}: ProductsToolbarProps) {
  const handleToggleScanner = onToggleScanner || onOpenScanner;

  return (
    <Card className="overflow-visible relative z-30">
      <CardContent className="p-3 sm:p-4 overflow-visible">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          {/* Search Input with Debounce & Trailing Actions */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
            <Input
              type="text"
              placeholder="Поиск по названию, штрихкоду или артикулу..."
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-9 pr-28 sm:pr-32 text-sm"
            />

            {/* Trailing Controls (Clear Button & Scanner Toggle Button) */}
            <div className="absolute right-1 top-1/2 -translate-y-1/2 flex items-center gap-1">
              {searchTerm && (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-xs"
                  onClick={() => onSearchChange('')}
                  className="text-muted-foreground hover:text-foreground"
                  title="Очистить поиск"
                >
                  <X />
                </Button>
              )}

              {searchTerm && handleToggleScanner && (
                <div className="h-4 w-px bg-border mx-0.5" />
              )}

              {handleToggleScanner && (
                <Button
                  type="button"
                  variant={isScannerOpen ? 'secondary' : 'ghost'}
                  size="sm"
                  data-scanner-toggle
                  onClick={handleToggleScanner}
                  className="gap-1.5"
                  title={isScannerOpen ? 'Скрыть сканер' : 'Сканировать штрихкод камерой'}
                >
                  <ScanBarcode data-icon="inline-start" className="text-primary" />
                  <span className="hidden sm:inline">Сканер</span>
                </Button>
              )}
            </div>

            {/* Embedded Scanner Panel right beneath search input */}
            {isScannerOpen && onCloseScanner && onScanBarcode && (
              <BarcodeScannerPanel
                isOpen={isScannerOpen}
                onClose={onCloseScanner}
                onScan={onScanBarcode}
              />
            )}
          </div>

          {/* Measure Filter: All / Piece (0) / Weight (1) using ToggleGroup */}
          <ToggleGroup
            type="single"
            variant="outline"
            size="sm"
            value={measureFilter === undefined ? 'all' : String(measureFilter)}
            onValueChange={(val) => {
              if (!val) return;
              if (val === 'all') onMeasureChange(undefined);
              else onMeasureChange(Number(val) as 0 | 1);
            }}
            className="self-start sm:self-auto"
          >
            <ToggleGroupItem value="all" className="gap-1.5 px-3">
              <LayoutGrid data-icon="inline-start" />
              <span>Все</span>
            </ToggleGroupItem>
            <ToggleGroupItem value="0" className="gap-1.5 px-3">
              <Package data-icon="inline-start" />
              <span>Штучные</span>
            </ToggleGroupItem>
            <ToggleGroupItem value="1" className="gap-1.5 px-3">
              <Scale data-icon="inline-start" />
              <span>Весовые</span>
            </ToggleGroupItem>
          </ToggleGroup>
        </div>
      </CardContent>
    </Card>
  );
}
