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
} from 'lucide-react';
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

  const handleSetDefault = async (templateId: string, templateName: string) => {
    try {
      await updateMutation.mutateAsync({
        id: templateId,
        dto: { isDefault: true },
      });
      toast.success(`Шаблон "${templateName}" установлен по умолчанию`);
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
          {templates.map((tpl) => (
            <Card
              key={tpl.id}
              className={`transition-all hover:shadow-md ${
                tpl.isDefault ? 'ring-2 ring-primary/40' : ''
              }`}
            >
              <CardHeader className="p-5 pb-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <CardTitle className="text-base font-semibold text-foreground">
                      {tpl.name}
                    </CardTitle>
                    <div className="flex items-center gap-1.5 mt-1.5">
                      <Badge variant="secondary" className="text-xs font-mono">
                        <Maximize2 className="size-3 mr-1 text-muted-foreground" />
                        {tpl.widthMm} × {tpl.heightMm} мм
                      </Badge>
                      {tpl.isDefault && (
                        <Badge variant="default" className="text-[10px] gap-1">
                          <Star className="size-3 fill-current" />
                          Основной
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
                    <span>Магазин:</span>
                    <strong className="text-foreground">
                      {tpl.config?.showStoreName
                        ? tpl.config.storeNameText || 'Включено'
                        : 'Выключено'}
                    </strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Штрихкод:</span>
                    <strong className="text-foreground">
                      {tpl.config?.showBarcode ? 'Выводится' : 'Скрыт'}
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
                  {!tpl.isDefault ? (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => handleSetDefault(tpl.id, tpl.name)}
                      className="text-xs text-muted-foreground hover:text-foreground"
                    >
                      <Star data-icon="inline-start" />
                      Сделать основным
                    </Button>
                  ) : (
                    <span className="text-xs text-primary font-medium flex items-center gap-1">
                      <Sparkles className="size-3.5" />
                      По умолчанию
                    </span>
                  )}

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
          ))}
        </div>
      )}
    </div>
  );
}
