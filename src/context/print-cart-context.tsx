'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { PrintJobItem, UmagProduct } from '@/lib/types';
import { toast } from 'sonner';

interface PrintCartContextType {
  items: PrintJobItem[];
  addItem: (product: UmagProduct, quantity?: number) => void;
  updateQuantity: (barcode: string, quantity: number) => void;
  removeItem: (barcode: string) => void;
  clearCart: () => void;
  totalLabelsCount: number;
}

const PrintCartContext = createContext<PrintCartContextType | undefined>(undefined);

const STORAGE_KEY = 'label_print_cart_items_v1';

export function PrintCartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<PrintJobItem[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        setItems(JSON.parse(stored));
      }
    } catch {
      // Ignore
    } finally {
      setIsLoaded(true);
    }
  }, []);

  // Sync to localStorage
  useEffect(() => {
    if (isLoaded) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
      } catch {
        // Ignore
      }
    }
  }, [items, isLoaded]);

  const addItem = (product: UmagProduct, quantity = 1) => {
    const barcodeStr = String(product.barcode);
    setItems((prev) => {
      const existing = prev.find((item) => item.barcode === barcodeStr);
      if (existing) {
        toast.info(`Количество "${product.name}" увеличено (+${quantity})`);
        return prev.map((item) =>
          item.barcode === barcodeStr
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      } else {
        toast.success(`Товар "${product.name}" добавлен в очередь печати`);
        return [
          ...prev,
          {
            barcode: barcodeStr,
            name: product.name,
            price: product.wholesalePrice, // Always wholesalePrice per state.md
            measureName: product.measureName || (product.type === 1 ? 'кг.' : 'шт.'),
            quantity,
          },
        ];
      }
    });
  };

  const updateQuantity = (barcode: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(barcode);
      return;
    }
    setItems((prev) =>
      prev.map((item) => (item.barcode === barcode ? { ...item, quantity } : item))
    );
  };

  const removeItem = (barcode: string) => {
    setItems((prev) => prev.filter((item) => item.barcode !== barcode));
  };

  const clearCart = () => {
    setItems([]);
  };

  const totalLabelsCount = items.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <PrintCartContext.Provider
      value={{
        items,
        addItem,
        updateQuantity,
        removeItem,
        clearCart,
        totalLabelsCount,
      }}
    >
      {children}
    </PrintCartContext.Provider>
  );
}

export function usePrintCart() {
  const context = useContext(PrintCartContext);
  if (!context) {
    throw new Error('usePrintCart must be used within a PrintCartProvider');
  }
  return context;
}
