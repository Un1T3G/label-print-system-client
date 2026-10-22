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
import { Sliders, Eye, Terminal } from 'lucide-react';
import { LabelLivePreview } from '@/features/templates';

interface PrintPreviewCardProps {
  templates?: PrintTemplate[];
  isLoadingTemplates: boolean;
  activeTemplate?: PrintTemplate;
  previewItem?: PrintJobItem;
  onSelectTemplateId: (id: string) => void;
  onOpenTsplModal: () => void;
}

export function PrintPreviewCard({
  templates,
  isLoadingTemplates,
  activeTemplate,
  previewItem,
  onSelectTemplateId,
  onOpenTsplModal,
}: PrintPreviewCardProps) {
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
            Выберите шаблон для печати текущего пакета ценников
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-0 flex flex-col gap-3">
          {isLoadingTemplates ? (
            <Skeleton className="h-9 w-full rounded-lg" />
          ) : (
            <Select
              value={activeTemplate?.id || ''}
              onValueChange={onSelectTemplateId}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Выберите шаблон..." />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  {templates?.map((t) => (
                    <SelectItem key={t.id} value={t.id}>
                      {t.name} ({t.widthMm}×{t.heightMm} мм)
                      {t.isDefault ? ' [По умолчанию]' : ''}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          )}

          {activeTemplate && (
            <div className="p-3 bg-muted/50 rounded-lg border border-border text-xs flex flex-col gap-1.5 text-muted-foreground">
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
                <span>Штрихкод:</span>
                <strong className="text-foreground">
                  {activeTemplate.config.showBarcode ? 'Да' : 'Нет'}
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
                        isWeight: previewItem.isWeight,
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
