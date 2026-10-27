'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { UmagProduct } from '@/features/products';
import { isWeightProduct, extractPluCode } from '@/features/templates';
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
        const plu = extractPluCode(product);

        if (existing) {
          // Silently increment — no toast spam, but ensure plu/isWeight/price are updated if missing
          set({
            items: items.map((item) =>
              item.barcode === barcodeStr
                ? {
                    ...item,
                    quantity: item.quantity + quantity,
                    plu: item.plu || plu,
                    isWeight: item.isWeight !== undefined ? item.isWeight : isWeight,
                    price: product.wholesalePrice || item.price,
                  }
                : item
            ),
          });
        } else {
          toast.success(`"${product.name}" добавлен в очередь`);
          set({
            items: [
              ...items,
              {
                barcode: barcodeStr,
                name: product.name,
                price: product.wholesalePrice,
                measureName: product.measureName || (isWeight ? 'кг.' : 'шт.'),
                quantity,
                plu,
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
          if (existing) {
            existing.quantity += ni.quantity;
            if (!existing.plu && ni.plu) existing.plu = ni.plu;
            if (existing.isWeight === undefined && ni.isWeight !== undefined) existing.isWeight = ni.isWeight;
          } else {
            itemMap.set(ni.barcode, { ...ni });
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

