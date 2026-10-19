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

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-lg p-0 overflow-hidden gap-0">
        <DialogHeader className="p-5 border-b border-border bg-muted/30">
          <DialogTitle className="text-base font-bold flex items-center gap-2">
            <Plus className="size-4 text-primary" />
            Добавить новый элемент на ценник
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground mt-0.5">
            Выберите тип блока для добавления в шаблон
          </DialogDescription>
        </DialogHeader>

        <div className="p-5 max-h-[460px] overflow-y-auto flex flex-col gap-2.5">
          {definitions.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.type}
                onClick={() => {
                  onAddElement(item.type);
                  onClose();
                }}
                className="p-3 rounded-xl border border-border hover:border-primary/50 hover:bg-accent/40 cursor-pointer transition-all flex items-center justify-between group"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-muted text-foreground group-hover:bg-primary group-hover:text-primary-foreground transition">
                    <Icon className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-semibold text-foreground group-hover:text-primary transition">
                      {item.label}
                    </h4>
                    <p className="text-[11px] text-muted-foreground mt-0.5">
                      {item.description}
                    </p>
                  </div>
                </div>

                <div className="text-xs font-semibold text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                  + Добавить
                </div>
              </div>
            );
          })}
        </div>
      </DialogContent>
    </Dialog>
  );
}
