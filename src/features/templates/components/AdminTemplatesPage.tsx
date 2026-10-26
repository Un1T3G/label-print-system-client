'use client';

import React from 'react';
import Link from 'next/link';
import { useTemplates, useDeleteTemplate, useUpdateTemplate } from '../hooks/use-templates';
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Badge,
  Skeleton,
  Alert,
  AlertTitle,
  AlertDescription,
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from '@/shared/ui';
import {
  Plus,
  Sliders,
  Edit2,
  Trash2,
  Star,
  Maximize2,
  Sparkles,
  AlertCircle,
  Scale,
  Tag,
  ChevronDown,
} from 'lucide-react';
import type { PrintTemplate } from '../types';
import { toast } from 'sonner';

export function AdminTemplatesPage() {
  const { data: templates, isLoading, error } = useTemplates();
  const deleteMutation = useDeleteTemplate();
  const updateMutation = useUpdateTemplate();

  const handleDelete = async (id: string, name: string) => {
    if (confirm(`Вы уверены, что хотите удалить шаблон "${name}"?`)) {
      try {
        await deleteMutation.mutateAsync(id);
        toast.success(`Шаблон "${name}" успешно удален`);
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'Ошибка удаления шаблона';
        toast.error(msg);
      }
    }
  };

  const handleSetTargetDefault = async (
    template: PrintTemplate,
    target: 'piece' | 'weight'
  ) => {
    try {
      const updatedConfig = {
        ...template.config,
        targetType: target,
        ...(target === 'piece'
          ? { isDefaultPiece: true }
          : { isDefaultWeight: true }),
      };

      await updateMutation.mutateAsync({
        id: template.id,
        dto: {
          isDefault: target === 'piece' ? true : template.isDefault,
          config: updatedConfig,
        },
      });

      toast.success(
        `Шаблон "${template.name}" установлен основным для ${
          target === 'piece' ? 'штучных (шт)' : 'весовых (кг)'
        } товаров`
      );
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Ошибка обновления';
      toast.error(msg);
    }
  };


  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="size-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
              <Sliders className="size-4" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              Шаблоны ценников
            </h1>
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            Управление параметрами печати, размерами этикеток и шрифтами
          </p>
        </div>

        <Link href="/admin/templates/new">
          <Button>
            <Plus data-icon="inline-start" />
            Создать шаблон
          </Button>
        </Link>
      </div>

      {/* Loading Skeleton */}
      {isLoading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {[1, 2, 3].map((n) => (
            <Card key={n} className="h-48 p-5 flex flex-col justify-between">
              <div className="flex flex-col gap-2">
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="h-4 w-1/3" />
              </div>
              <Skeleton className="h-16 w-full rounded-lg" />
              <div className="flex justify-between items-center">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-8 w-16" />
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Error state */}
      {error && !isLoading && (
        <Alert variant="destructive">
          <AlertCircle />
          <AlertTitle>Ошибка при загрузке шаблонов</AlertTitle>
          <AlertDescription>Проверьте подключение к базе данных.</AlertDescription>
        </Alert>
      )}

      {/* Templates Grid */}
      {!isLoading && templates && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {templates.map((tpl) => {
            const hasBothViews =
              (Boolean(tpl.config?.pieceElements) && Boolean(tpl.config?.weightElements)) ||
              tpl.config?.targetType === 'all';
            const isWeight =
              !hasBothViews &&
              (tpl.config?.targetType === 'weight' || tpl.name.toLowerCase().includes('весов'));
            const isPiece =
              !hasBothViews && !isWeight;

            return (
              <Card
                key={tpl.id}
                className={`transition-all hover:shadow-md ${
                  tpl.isDefault ? 'ring-2 ring-primary/40 shadow-xs' : ''
                }`}
              >
                <CardHeader className="p-5 pb-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="space-y-1.5">
                      <CardTitle className="text-base font-semibold text-foreground">
                        {tpl.name}
                      </CardTitle>
                      <div className="flex flex-wrap items-center gap-1.5">
                        <Badge variant="secondary" className="text-xs font-mono">
                          <Maximize2 className="size-3 mr-1 text-muted-foreground" />
                          {tpl.widthMm} × {tpl.heightMm} мм
                        </Badge>

                        {/* Target badge */}
                        {hasBothViews ? (
                          <Badge
                            variant="outline"
                            className="text-[10px] bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20 gap-1 font-medium"
                          >
                            <Tag className="size-2.5" />
                            <span>+</span>
                            <Scale className="size-2.5" />
                            Шт + Кг (2 в 1)
                          </Badge>
                        ) : isWeight ? (
                          <Badge
                            variant="outline"
                            className="text-[10px] bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 gap-1 font-medium"
                          >
                            <Scale className="size-3" />
                            Весовой (кг)
                          </Badge>
                        ) : (
                          <Badge
                            variant="outline"
                            className="text-[10px] bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20 gap-1 font-medium"
                          >
                            <Tag className="size-3" />
                            Штучный (шт)
                          </Badge>
                        )}

                        {/* Default Badge */}
                        {tpl.isDefault && (
                          <Badge variant="default" className="text-[10px] gap-1 bg-primary hover:bg-primary">
                            <Star className="size-3 fill-current" />
                            Основной по умолчанию
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="p-5 pt-0 flex flex-col gap-4">
                  {/* Details summary */}
                  <div className="p-3 bg-muted/40 rounded-lg text-xs flex flex-col gap-1.5 text-muted-foreground border border-border">
                    <div className="flex justify-between">
                      <span>Поддержка видов:</span>
                      <strong className="text-foreground">
                        {hasBothViews
                          ? 'Штучный (Штрихкод) + Весовой (PLU)'
                          : isWeight
                          ? 'Весовой с PLU'
                          : 'Штучный со штрихкодом'}
                      </strong>
                    </div>
                    <div className="flex justify-between">
                      <span>Штрихкод / PLU:</span>
                      <strong className="text-foreground">
                        {hasBothViews ? 'Автоматически по типу товара' : isWeight ? 'Только PLU' : 'Штрихкод EAN-13/128'}
                      </strong>
                    </div>
                    <div className="flex justify-between">
                      <span>Шрифт названия / цены:</span>
                      <strong className="text-foreground font-mono">
                        {tpl.config?.titleFontSize || 12}pt / {tpl.config?.priceFontSize || 24}pt
                      </strong>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center justify-between pt-2 border-t border-border">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="text-xs text-muted-foreground hover:text-foreground gap-1"
                        >
                          <Star className="size-3.5" />
                          <span>Основной...</span>
                          <ChevronDown className="size-3 opacity-60" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="start">
                        <DropdownMenuItem
                          onClick={() => handleSetTargetDefault(tpl, 'piece')}
                          className="cursor-pointer gap-2"
                        >
                          <Tag className="size-3.5 text-blue-500" />
                          <span>Основной для штучных (шт)</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleSetTargetDefault(tpl, 'weight')}
                          className="cursor-pointer gap-2"
                        >
                          <Scale className="size-3.5 text-emerald-500" />
                          <span>Основной для весовых (кг)</span>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>

                    <div className="flex items-center gap-1">
                      <Link href={`/admin/templates/${tpl.id}`}>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-xs"
                          title="Редактировать"
                        >
                          <Edit2 data-icon="inline-start" />
                          Изменить
                        </Button>
                      </Link>

                      <Button
                        variant="ghost"
                        size="icon-xs"
                        onClick={() => handleDelete(tpl.id, tpl.name)}
                        disabled={tpl.isDefault}
                        className="text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                        title={tpl.isDefault ? 'Нельзя удалить основной шаблон' : 'Удалить'}
                      >
                        <Trash2 />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}

        </div>
      )}
    </div>
  );
}
