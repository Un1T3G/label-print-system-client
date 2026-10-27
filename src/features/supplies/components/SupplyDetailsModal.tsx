'use client';

import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  Button,
  Badge,
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
  Input,
} from '@/shared/ui';
import {
  Printer,
  Package,
  Layers,
  Search,
  Check,
  Plus,
  Loader2,
  AlertCircle,
} from 'lucide-react';
import { useSupplyDetailsQuery } from '../hooks/use-supplies';
import { usePrintCart } from '@/features/print';
import { isWeightProduct, extractPluCode } from '@/features/templates';
import type { PrintJobItem } from '@/shared/api';
import type { UmagSupplyProductItem } from '../types';
import { toast } from 'sonner';

interface SupplyDetailsModalProps {
  supplyId: number | null;
  onClose: () => void;
}

export function SupplyDetailsModal({
  supplyId,
  onClose,
}: SupplyDetailsModalProps) {
  const { data: supply, isLoading, isError, error } = useSupplyDetailsQuery(supplyId);
  const { addBatch, addItem } = usePrintCart();

  const [filterText, setFilterText] = React.useState('');
  const [addedBarcodes, setAddedBarcodes] = React.useState<Set<string>>(new Set());

  // Reset local state when opened with a new ID
  React.useEffect(() => {
    setFilterText('');
    setAddedBarcodes(new Set());
  }, [supplyId]);

  const products: UmagSupplyProductItem[] = supply?.supplyProducts || [];

  const filteredProducts = React.useMemo(() => {
    if (!filterText.trim()) return products;
    const lower = filterText.toLowerCase();
    return products.filter((p) => {
      const name = p.product?.name || p.draftName || '';
      const barcode = String(p.barcode || '');
      return name.toLowerCase().includes(lower) || barcode.includes(lower);
    });
  }, [products, filterText]);

  const mapToPrintItem = (
    p: UmagSupplyProductItem,
    quantity: number
  ): PrintJobItem => {
    const effectivePrice =
      p.sellingPrice ||
      p.productDetail?.sellingPrice ||
      p.price ||
      0;

    const productName =
      p.product?.name ||
      p.draftName ||
      p.product?.fullName ||
      'Товар без названия';

    const isWeight = isWeightProduct({
      type: p.product?.type ?? p.type,
      isWeight: p.product?.type === 1 || p.product?.measure === 1 || p.type === 1,
      name: productName,
      fullName: p.product?.fullName || undefined,
    });
    const plu = extractPluCode({
      plu: (p.product as any)?.plu,
      aliasList: (p.product as any)?.aliasList,
      aliases: (p.product as any)?.aliases,
    });

    return {
      barcode: String(p.barcode),
      name: productName,
      price: effectivePrice,
      measureName: isWeight ? 'кг.' : 'шт.',
      quantity: Math.max(1, Math.round(quantity)),
      plu,
      isWeight,
    };
  };

  const handleAddAllToCart = (mode: 'single' | 'byQuantity') => {
    if (!products.length) return;

    const printItems: PrintJobItem[] = products.map((p) => {
      const qty = mode === 'byQuantity' ? (p.quantity || 1) : 1;
      return mapToPrintItem(p, qty);
    });

    addBatch(printItems);

    const allBarcodes = new Set(products.map((p) => String(p.barcode)));
    setAddedBarcodes(allBarcodes);
  };

  const handleAddSingleProduct = (p: UmagSupplyProductItem) => {
    const item = mapToPrintItem(p, 1);
    addItem({
      id: p.product?.id || p.id,
      barcode: Number(item.barcode) || 0,
      name: item.name,
      fullName: item.name,
      type: item.isWeight ? 1 : 0,
      measureName: item.measureName,
      arrivalCost: p.arrivalCost || p.price || 0,
      sellingPrice: item.price,
      wholesalePrice: item.price,
      aliasList: (p.product as any)?.aliasList || [],
    }, 1);

    setAddedBarcodes((prev) => new Set(prev).add(String(p.barcode)));
  };

  const formatDocTime = (timeStr?: string) => {
    if (!timeStr) return '—';
    try {
      const d = new Date(timeStr);
      return d.toLocaleString('ru-RU', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return timeStr;
    }
  };

  return (
    <Dialog open={supplyId !== null} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="w-full sm:max-w-5xl max-h-[90vh] flex flex-col p-0 gap-0 overflow-hidden">
        {/* Modal Header */}
        <DialogHeader className="p-5 pb-4 pr-14 border-b border-border/80 bg-muted/20 shrink-0">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <DialogTitle className="text-lg font-bold tracking-tight">
                  Приемка #{supplyId}
                </DialogTitle>
                <Badge variant="outline" className="text-xs bg-background/80">
                  {supply?.supplierName || 'Загрузка...'}
                </Badge>
              </div>
              <DialogDescription className="text-xs text-muted-foreground mt-1">
                Дата документа: {formatDocTime(supply?.time)}
              </DialogDescription>
            </div>

            {/* Quick summary badges */}
            {supply && (
              <div className="flex items-center gap-2">
                <div className="bg-amber-500/10 border border-amber-500/20 px-2.5 py-1 rounded-md text-right">
                  <span className="text-[10px] text-muted-foreground block uppercase font-medium">Закупка</span>
                  <span className="text-xs font-bold text-amber-600 dark:text-amber-400">
                    {Math.round(supply.amount || supply.arrivalAmount || 0).toLocaleString('ru-RU')} сум
                  </span>
                </div>
                <div className="bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-md text-right">
                  <span className="text-[10px] text-muted-foreground block uppercase font-medium">Розница</span>
                  <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                    {Math.round(supply.sellingAmount || 0).toLocaleString('ru-RU')} сум
                  </span>
                </div>
              </div>
            )}
          </div>
        </DialogHeader>


        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {isLoading && (
            <div className="py-16 flex flex-col items-center justify-center gap-3 text-muted-foreground">
              <Loader2 className="size-8 animate-spin text-primary" />
              <p className="text-sm">Загрузка состава накладной...</p>
            </div>
          )}

          {isError && (
            <div className="py-12 flex flex-col items-center justify-center gap-2 text-destructive">
              <AlertCircle className="size-8" />
              <p className="text-sm font-medium">Не удалось загрузить данные приемки</p>
              <p className="text-xs text-muted-foreground">
                {error instanceof Error ? error.message : 'Ошибка сервера'}
              </p>
            </div>
          )}

          {!isLoading && !isError && supply && (
            <>
              {/* Batch Print Actions Bar */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-muted/40 p-3 rounded-lg border border-border/60">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                    <Package className="size-4 text-primary" />
                    Товаров: {products.length} поз.
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <Button
                    type="button"
                    size="sm"
                    className="h-8 text-xs gap-1.5 font-medium shadow-xs"
                    onClick={() => handleAddAllToCart('single')}
                  >
                    <Printer className="size-3.5" />
                    В печать (по 1 ценнику)
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="h-8 text-xs gap-1.5 font-medium"
                    onClick={() => handleAddAllToCart('byQuantity')}
                    title="Добавить количество ценников равное количеству каждого товара в накладной"
                  >
                    <Layers className="size-3.5" />
                    По кол-ву товара
                  </Button>
                </div>
              </div>

              {/* Local Search */}
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
                <Input
                  placeholder="Фильтр товаров по названию или штрихкоду..."
                  value={filterText}
                  onChange={(e) => setFilterText(e.target.value)}
                  className="h-8 pl-8 text-xs"
                />
              </div>

              {/* Products Table */}
              <div className="rounded-lg border border-border overflow-x-auto">
                <Table className="min-w-[760px] w-full">
                  <TableHeader className="bg-muted/30">
                    <TableRow className="hover:bg-transparent">
                      <TableHead className="w-12 text-xs">#</TableHead>
                      <TableHead className="w-36 text-xs font-mono">Штрихкод</TableHead>
                      <TableHead className="min-w-[220px] text-xs">Наименование товара</TableHead>
                      <TableHead className="w-24 text-xs text-right whitespace-nowrap">Кол-во</TableHead>
                      <TableHead className="w-28 text-xs text-right whitespace-nowrap">Закупка</TableHead>
                      <TableHead className="w-28 text-xs text-right whitespace-nowrap">Продажа</TableHead>
                      <TableHead className="w-28 text-xs text-center whitespace-nowrap">Печать</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredProducts.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="h-24 text-center text-xs text-muted-foreground">
                          {filterText ? 'Ничего не найдено по фильтру' : 'В накладной нет товаров'}
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredProducts.map((p, idx) => {
                        const barcodeStr = String(p.barcode);
                        const isAdded = addedBarcodes.has(barcodeStr);
                        const isWeight = p.product?.type === 1 || p.product?.measure === 1;
                        const effectivePrice =
                          p.sellingPrice ||
                          p.productDetail?.sellingPrice ||
                          p.price ||
                          0;

                        return (
                          <TableRow key={p.id || idx} className="hover:bg-muted/40 transition-colors">
                            <TableCell className="text-xs text-muted-foreground py-2 font-mono">
                              {idx + 1}
                            </TableCell>
                            <TableCell className="text-xs py-2 font-mono text-muted-foreground whitespace-nowrap">
                              {barcodeStr}
                            </TableCell>
                            <TableCell
                              className="text-xs py-2 font-medium text-foreground max-w-[340px] truncate"
                              title={p.product?.name || p.draftName || ''}
                            >
                              {p.product?.name || p.draftName || 'Товар без названия'}
                            </TableCell>
                            <TableCell className="text-xs py-2 text-right font-medium whitespace-nowrap">
                              {p.quantity} {isWeight ? 'кг.' : 'шт.'}
                            </TableCell>
                            <TableCell className="text-xs py-2 text-right text-muted-foreground font-mono whitespace-nowrap">
                              {Math.round(p.arrivalCost || p.price || 0).toLocaleString('ru-RU')} сум
                            </TableCell>
                            <TableCell className="text-xs py-2 text-right font-bold text-emerald-600 dark:text-emerald-400 font-mono whitespace-nowrap">
                              {Math.round(effectivePrice).toLocaleString('ru-RU')} сум
                            </TableCell>
                            <TableCell className="text-xs py-2 text-center whitespace-nowrap">
                              <Button
                                type="button"
                                size="sm"
                                variant={isAdded ? 'secondary' : 'outline'}
                                className="h-7 px-2.5 text-[11px] gap-1"
                                onClick={() => handleAddSingleProduct(p)}
                              >
                                {isAdded ? (
                                  <>
                                    <Check className="size-3 text-emerald-600 dark:text-emerald-400" />
                                    <span>В очереди</span>
                                  </>
                                ) : (
                                  <>
                                    <Plus className="size-3" />
                                    <span>Ценник</span>
                                  </>
                                )}
                              </Button>
                            </TableCell>
                          </TableRow>
                        );
                      })
                    )}
                  </TableBody>
                </Table>
              </div>

            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
