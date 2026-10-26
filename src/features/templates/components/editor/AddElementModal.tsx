'use client';

import React from 'react';
import type { LabelElementType } from '../../types';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/shared/ui';
import { Plus } from 'lucide-react';
import { getAllElementDefinitions } from '../../model/element-registry';

interface AddElementModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddElement: (type: LabelElementType) => void;
}

export function AddElementModal({
  isOpen,
  onClose,
  onAddElement,
}: AddElementModalProps) {
  const definitions = getAllElementDefinitions();

  const categories = [
    {
      title: '🔢 Коды и маркировка',
      types: ['barcode', 'pluCode', 'qrcode', 'productCode'] as LabelElementType[],
    },
    {
      title: '🏷️ Основные данные товара',
      types: ['productName', 'price', 'oldPrice', 'country'] as LabelElementType[],
    },
    {
      title: '🎨 Оформление и магазин',
      types: ['storeName', 'discountBadge', 'divider', 'date', 'customText'] as LabelElementType[],
    },
  ];

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="w-full sm:max-w-2xl p-0 overflow-hidden gap-0">
        <DialogHeader className="p-5 pr-14 border-b border-border bg-muted/30">
          <DialogTitle className="text-base font-bold flex items-center gap-2">
            <Plus className="size-4 text-primary" />
            Добавить элемент на ценник
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground mt-0.5">
            Выберите необходимый блок для размещения на макете ценника
          </DialogDescription>
        </DialogHeader>

        <div className="p-5 max-h-[500px] overflow-y-auto space-y-4">
          {categories.map((cat) => {
            const catItems = definitions.filter((d) => cat.types.includes(d.type));
            if (catItems.length === 0) return null;

            return (
              <div key={cat.title} className="space-y-2">
                <h4 className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider px-1">
                  {cat.title}
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {catItems.map((item) => {
                    const Icon = item.icon;
                    const isNew = item.type === 'pluCode';

                    return (
                      <div
                        key={item.type}
                        onClick={() => {
                          onAddElement(item.type);
                          onClose();
                        }}
                        className="p-3 rounded-xl border border-border hover:border-primary/50 hover:bg-accent/40 cursor-pointer transition-all flex items-start gap-3 group bg-card"
                      >
                        <div className="p-2 rounded-lg bg-muted text-foreground group-hover:bg-primary group-hover:text-primary-foreground transition shrink-0 mt-0.5">
                          <Icon className="w-4 h-4" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-1.5">
                            <h5 className="text-xs font-semibold text-foreground group-hover:text-primary transition truncate">
                              {item.label}
                            </h5>
                            {isNew && (
                              <span className="text-[9px] font-bold bg-amber-500/15 text-amber-600 dark:text-amber-400 px-1.5 py-0.2 rounded font-mono">
                                NEW
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-muted-foreground mt-0.5 line-clamp-2 leading-snug">
                            {item.description}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </DialogContent>
    </Dialog>
  );
}
