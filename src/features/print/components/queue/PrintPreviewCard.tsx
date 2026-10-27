'use client';

import React from 'react';
import Link from 'next/link';
import type { PrintTemplate } from '@/features/templates';
import type { PrintJobItem } from '../../types';
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Skeleton,
} from '@/shared/ui';
import { Sliders, Eye, Terminal, Sparkles } from 'lucide-react';

import { LabelLivePreview, isWeightProduct } from '@/features/templates';

interface PrintPreviewCardProps {
  templates?: PrintTemplate[];
  isLoadingTemplates: boolean;
  activeTemplate?: PrintTemplate;
  previewItem?: PrintJobItem;
  selectedTemplateId?: string;
  onSelectTemplateId: (id: string) => void;
  onOpenTsplModal: () => void;
}

export function PrintPreviewCard({
  templates,
  isLoadingTemplates,
  activeTemplate,
  previewItem,
  selectedTemplateId = 'auto',
  onSelectTemplateId,
  onOpenTsplModal,
}: PrintPreviewCardProps) {
  const isAutoMode = selectedTemplateId === 'auto' || !selectedTemplateId;

  return (
    <div className="flex flex-col gap-5">
      {/* Template Selection Card */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base flex items-center gap-2">
              <Sliders className="size-4 text-primary" />
              Шаблон ценника
            </CardTitle>
            <Link
              href="/admin/templates/new"
              className="text-xs text-primary hover:underline font-medium"
            >
              + Создать шаблон
            </Link>
          </div>
          <CardDescription className="text-xs">
            Автоматический выбор раздельных шаблонов или принудительный шаблон
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-0 flex flex-col gap-3">
          {isLoadingTemplates ? (
            <Skeleton className="h-9 w-full rounded-lg" />
          ) : (
            <Select
              value={selectedTemplateId || 'auto'}
              onValueChange={onSelectTemplateId}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Выберите шаблон..." />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectItem value="auto" className="font-semibold text-primary">
                    ⚡ Автовыбор (Штучный / Весовой)
                  </SelectItem>
                  {templates?.map((t) => {
                    const hasBothViews =
                      (Boolean(t.config?.pieceElements) && Boolean(t.config?.weightElements)) ||
                      t.config?.targetType === 'all';
                    const isWeight =
                      !hasBothViews &&
                      (t.config?.targetType === 'weight' || t.name.toLowerCase().includes('весов'));
                    const icon = hasBothViews ? '🏷️⚖️ ' : isWeight ? '⚖️ ' : '🏷️ ';

                    return (
                      <SelectItem key={t.id} value={t.id}>
                        {icon}{t.name} ({t.widthMm}×{t.heightMm} мм)
                        {t.isDefault ? ' [Основной]' : ''}
                      </SelectItem>
                    );
                  })}
                </SelectGroup>
              </SelectContent>
            </Select>
          )}

          {isAutoMode && (
            <div className="flex items-start gap-2 p-2.5 bg-primary/5 rounded-lg border border-primary/20 text-xs text-primary">
              <Sparkles className="size-4 shrink-0 mt-0.5" />
              <div className="leading-tight">
                <span className="font-semibold block">Умный автовыбор активен</span>
                <span className="text-[11px] text-muted-foreground mt-0.5 block">
                  Для штучных товаров используется шаблон со штрихкодом, для весовых — шаблон с крупным PLU-кодом.
                </span>
              </div>
            </div>
          )}

          {activeTemplate && (
            <div className="p-3 bg-muted/50 rounded-lg border border-border text-xs flex flex-col gap-1.5 text-muted-foreground">
              <div className="flex justify-between">
                <span>Текущий макет для превью:</span>
                <strong className="text-foreground">{activeTemplate.name}</strong>
              </div>
              <div className="flex justify-between">
                <span>Физический размер:</span>
                <strong className="text-foreground">
                  {activeTemplate.widthMm} × {activeTemplate.heightMm} мм
                </strong>
              </div>
              <div className="flex justify-between">
                <span>Магазин:</span>
                <strong className="text-foreground">
                  {activeTemplate.config.showStoreName
                    ? activeTemplate.config.storeNameText || 'Alpamis'
                    : 'Скрыт'}
                </strong>
              </div>
              <div className="flex justify-between">
                <span>Штрихкод / PLU:</span>
                <strong className="text-foreground">
                  {activeTemplate.config.showBarcode !== false ? 'Штрихкод выводится' : 'Только PLU-код'}
                </strong>
              </div>
            </div>
          )}
        </CardContent>
      </Card>


      {/* Live Preview Card */}
      <Card>
        <CardHeader className="pb-2 flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-base flex items-center gap-2">
              <Eye className="size-4 text-primary" />
              Предпросмотр ценника
            </CardTitle>
            <CardDescription className="text-xs">
              Как ценник будет выглядеть на бумаге
            </CardDescription>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onOpenTsplModal}
            title="Посмотреть сгенерированные TSPL команды"
          >
            <Terminal data-icon="inline-start" />
            TSPL код
          </Button>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="label-preview-container min-h-[220px]">
            {activeTemplate ? (
              <LabelLivePreview
                widthMm={activeTemplate.widthMm}
                heightMm={activeTemplate.heightMm}
                config={activeTemplate.config}
                product={
                  previewItem
                    ? {
                        name: previewItem.name,
                        price: previewItem.price,
                        barcode: previewItem.barcode,
                        measureName: previewItem.measureName,
                        plu: previewItem.plu,
                        isWeight: isWeightProduct(previewItem),
                      }
                    : undefined
                }
                isInteractive={false}
              />
            ) : (
              <div className="text-xs text-muted-foreground">
                Выберите шаблон для предпросмотра
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
