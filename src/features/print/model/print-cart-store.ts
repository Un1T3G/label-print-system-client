'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { UmagProduct } from '@/features/products';
import type { PrintJobItem } from '../types';
import { toast } from 'sonner';

interface PrintCartState {
  items: PrintJobItem[];
  addItem: (product: UmagProduct, quantity?: number) => void;
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

        if (existing) {
          // Silently increment — no toast spam
          set({
            items: items.map((item) =>
              item.barcode === barcodeStr
                ? { ...item, quantity: item.quantity + quantity }
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
                measureName: product.measureName || (product.type === 1 ? 'кг.' : 'шт.'),
                quantity,
              },
            ],
          });
        }
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
  const updateQuantity = usePrintCartStore((s) => s.updateQuantity);
  const removeItem = usePrintCartStore((s) => s.removeItem);
  const clearCart = usePrintCartStore((s) => s.clearCart);
  const totalLabelsCount = items.reduce((acc, item) => acc + item.quantity, 0);

  return {
    items,
    addItem,
    updateQuantity,
    removeItem,
    clearCart,
    totalLabelsCount,
  };
}
