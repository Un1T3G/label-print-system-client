'use client';

import React from 'react';
import type { LabelElement, LabelElementType } from '../../types';
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/shared/ui';
import {
  Layers,
  Undo2,
  Plus,
  Eye,
  EyeOff,
  Copy,
  Trash2,
  ArrowUp,
  ArrowDown,
} from 'lucide-react';
import { cn } from '@/shared/lib/utils';
import { getElementDefinition } from '../../model/element-registry';

export function getElementIcon(type: LabelElementType) {
  const definition = getElementDefinition(type);
  const Icon = definition.icon;
  return <Icon className="w-3.5 h-3.5" />;
}

interface ElementListCardProps {
  elements: LabelElement[];
  selectedElementId: string | null;
  onSelectElement: (id: string) => void;
  onOpenAddModal: () => void;
  onResetToDefault: () => void;
  onReorder: (id: string, direction: 'up' | 'down') => void;
  onToggleVisibility: (id: string) => void;
  onDuplicate: (id: string) => void;
  onDelete: (id: string) => void;
}

export function ElementListCard({
  elements,
  selectedElementId,
  onSelectElement,
  onOpenAddModal,
  onResetToDefault,
  onReorder,
  onToggleVisibility,
  onDuplicate,
  onDelete,
}: ElementListCardProps) {
  return (
    <Card className="border-slate-200 dark:border-slate-800 shadow-xs bg-white dark:bg-slate-900">
      <CardHeader className="p-4 pb-3 flex flex-row items-center justify-between border-b border-slate-100 dark:border-slate-800">
        <div>
          <CardTitle className="text-sm font-bold flex items-center gap-2">
            <Layers className="w-4 h-4 text-blue-600" />
            Слои ценника ({elements.length})
          </CardTitle>
          <CardDescription className="text-xs">
            Управляйте порядком и видимостью элементов ценника
          </CardDescription>
        </div>

        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onResetToDefault}
            className="text-xs text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 gap-1 h-8"
            title="Восстановить стандартный набор элементов"
          >
            <Undo2 className="w-3.5 h-3.5" />
            Сброс
          </Button>

          <Button
            type="button"
            size="sm"
            onClick={onOpenAddModal}
            className="text-xs bg-blue-600 hover:bg-blue-700 text-white gap-1.5 h-8 font-semibold shadow-xs"
          >
            <Plus className="w-3.5 h-3.5" />
            Добавить элемент
          </Button>
        </div>
      </CardHeader>

      <CardContent className="p-3 space-y-1.5 max-h-[380px] overflow-y-auto">
        {[...elements]
          .sort((a, b) => a.order - b.order)
          .map((el, idx, arr) => {
            const isSelected = el.id === selectedElementId;

            return (
              <div
                key={el.id}
                onClick={() => onSelectElement(el.id)}
                className={cn(
                  'group flex items-center justify-between p-2.5 rounded-xl border transition-all cursor-pointer text-xs select-none',
                  isSelected
                    ? 'bg-blue-50/70 border-blue-400 dark:bg-blue-950/40 dark:border-blue-700 shadow-xs ring-1 ring-blue-400/50'
                    : 'bg-slate-50/60 dark:bg-slate-800/40 border-slate-200/80 dark:border-slate-800 hover:bg-white dark:hover:bg-slate-800 hover:border-slate-300',
                  !el.visible && 'opacity-50 bg-slate-100/50 dark:bg-slate-900/50'
                )}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="flex items-center justify-center w-6 h-6 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-500 shrink-0 shadow-2xs font-mono text-[10px]">
                    {idx + 1}
                  </div>

                  <div className="p-1 rounded-md bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shrink-0">
                    {getElementIcon(el.type)}
                  </div>

                  <div className="truncate">
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold text-slate-900 dark:text-slate-100 truncate">
                        {el.label}
                      </span>
                      {!el.visible && (
                        <span className="text-[10px] text-slate-400 font-normal italic">
                          (скрыт)
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate max-w-[200px] font-mono">
                      {el.content || (el.type === 'price' ? '12 000 сум' : el.type === 'barcode' ? '4780111550194' : el.type)}
                    </p>
                  </div>
                </div>

                {/* Quick Controls: Move Up/Down, Visibility, Duplicate, Delete */}
                <div
                  className="flex items-center gap-1 shrink-0"
                  onClick={(e) => e.stopPropagation()}
                >
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    disabled={idx === 0}
                    onClick={() => onReorder(el.id, 'up')}
                    className="w-7 h-7 p-0 text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 disabled:opacity-30 disabled:hover:text-slate-400 rounded transition"
                    title="Переместить выше"
                  >
                    <ArrowUp className="w-3.5 h-3.5" />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    disabled={idx === arr.length - 1}
                    onClick={() => onReorder(el.id, 'down')}
                    className="w-7 h-7 p-0 text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 disabled:opacity-30 disabled:hover:text-slate-400 rounded transition"
                    title="Переместить ниже"
                  >
                    <ArrowDown className="w-3.5 h-3.5" />
                  </Button>

                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => onToggleVisibility(el.id)}
                    className={cn(
                      'w-7 h-7 p-0 rounded transition ml-1',
                      el.visible
                        ? 'text-blue-600 hover:bg-blue-100/60'
                        : 'text-slate-400 hover:text-slate-700 hover:bg-slate-100'
                    )}
                    title={el.visible ? 'Скрыть с ценника' : 'Показать на ценнике'}
                  >
                    {el.visible ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                  </Button>

                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => onDuplicate(el.id)}
                    className="w-7 h-7 p-0 text-slate-400 hover:text-slate-800 hover:bg-slate-100 rounded transition"
                    title="Дублировать элемент"
                  >
                    <Copy className="w-3.5 h-3.5" />
                  </Button>

                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => onDelete(el.id)}
                    className="w-7 h-7 p-0 text-red-400 hover:text-red-700 hover:bg-red-50 rounded transition"
                    title="Удалить элемент"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>
            );
          })}
      </CardContent>
    </Card>
  );
}
