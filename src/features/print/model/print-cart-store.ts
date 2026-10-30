'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { UmagProduct } from '@/features/products';
import { isWeightProduct } from '@/features/templates';
import type { PrintJobItem } from '../types';
import { toast } from 'sonner';

interface PrintCartState {
  items: PrintJobItem[];
  addItem: (product: UmagProduct, quantity?: number) => void;
  addBatch: (newItems: PrintJobItem[]) => void;
  updateQuantity: (barcode: string, quantity: number) => void;
  removeItem: (barcode: string) => void;
  clearCart: () => void;
}

export const usePrintCartStore = create<PrintCartState>()(
  persist(
    (set, get) => ({
      items: [],
      addItem: (product, quantity = 1) => {
        const barcodeStr = String(product.barcode);
        const { items } = get();
        const existing = items.find((item) => item.barcode === barcodeStr);
        const isWeight = isWeightProduct(product);
        // PLU код весового товара — это просто первый элемент массива алиасов
        const plu = product.aliasList?.[0] || '';

        if (existing) {
          // Silently increment — no toast spam, but ensure plu/aliasList/isWeight/price are updated if missing
          const effectivePrice =
            product.wholesalePrice ||
            (product as any).price ||
            product.sellingPrice ||
            0;

          set({
            items: items.map((item) =>
              item.barcode === barcodeStr
                ? {
                    ...item,
                    quantity: item.quantity + quantity,
                    plu: product.aliasList?.[0] || item.plu || plu || '',
                    aliasList: product.aliasList || item.aliasList,
                    isWeight: item.isWeight !== undefined ? item.isWeight : isWeight,
                    price: effectivePrice || item.price || 0,
                  }
                : item
            ),
          });
        } else {
          toast.success(`"${product.name}" добавлен в очередь`);
          const effectivePrice =
            product.wholesalePrice ||
            (product as any).price ||
            product.sellingPrice ||
            0;

          set({
            items: [
              ...items,
              {
                barcode: barcodeStr,
                name: product.name,
                price: effectivePrice,
                measureName: product.measureName || (isWeight ? 'кг.' : 'шт.'),
                quantity,
                plu,
                aliasList: product.aliasList,
                isWeight,
              },
            ],
          });
        }
      },
      addBatch: (newItems: PrintJobItem[]) => {
        if (!newItems.length) return;
        const { items } = get();
        const itemMap = new Map(items.map((i) => [i.barcode, { ...i }]));
        for (const ni of newItems) {
          const existing = itemMap.get(ni.barcode);
          const itemPlu = ni.aliasList?.[0] || ni.plu || '';
          if (existing) {
            existing.quantity += ni.quantity;
            if (itemPlu) existing.plu = itemPlu;
            if (ni.aliasList) existing.aliasList = ni.aliasList;
            if (existing.isWeight === undefined && ni.isWeight !== undefined) existing.isWeight = ni.isWeight;
          } else {
            itemMap.set(ni.barcode, {
              ...ni,
              plu: itemPlu,
            });
          }
        }
        set({ items: Array.from(itemMap.values()) });
        toast.success(`Добавлено позиций в очередь печати: ${newItems.length}`);
      },
      updateQuantity: (barcode, quantity) => {
        if (quantity <= 0) {
          get().removeItem(barcode);
          return;
        }
        set((state) => ({
          items: state.items.map((item) =>
            item.barcode === barcode ? { ...item, quantity } : item
          ),
        }));
      },
      removeItem: (barcode) => {
        set((state) => ({
          items: state.items.filter((item) => item.barcode !== barcode),
        }));
      },
      clearCart: () => {
        set({ items: [] });
      },
    }),
    {
      name: 'label_print_cart_items_v1',
    }
  )
);

export function usePrintCart() {
  const items = usePrintCartStore((s) => s.items);
  const addItem = usePrintCartStore((s) => s.addItem);
  const addBatch = usePrintCartStore((s) => s.addBatch);
  const updateQuantity = usePrintCartStore((s) => s.updateQuantity);
  const removeItem = usePrintCartStore((s) => s.removeItem);
  const clearCart = usePrintCartStore((s) => s.clearCart);
  const totalLabelsCount = items.reduce((acc, item) => acc + item.quantity, 0);

  return {
    items,
    addItem,
    addBatch,
    updateQuantity,
    removeItem,
    clearCart,
    totalLabelsCount,
  };
}

