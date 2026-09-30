'use client';

import React from 'react';
import Link from 'next/link';
import { useTemplates, useDeleteTemplate, useUpdateTemplate } from '@/hooks/useTemplates';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Plus,
  Sliders,
  Edit2,
  Trash2,
  Star,
  Maximize2,
  Calendar,
  Layers,
  Sparkles,
} from 'lucide-react';
import { toast } from 'sonner';

export default function TemplatesListPage() {
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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center">
              <Sliders className="w-4 h-4" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              Шаблоны ценников
            </h1>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            Управление параметрами печати, размерами этикеток и шрифтами
          </p>
        </div>

        <Link href="/admin/templates/new">
          <Button className="bg-blue-600 hover:bg-blue-700 text-white gap-1.5 shadow-sm">
            <Plus className="w-4 h-4" />
            Создать шаблон
          </Button>
        </Link>
      </div>

      {/* Loading Skeleton */}
      {isLoading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {[1, 2, 3].map((n) => (
            <div
              key={n}
              className="h-48 rounded-xl border border-slate-200 bg-white p-5 animate-pulse"
            />
          ))}
        </div>
      )}

      {/* Error state */}
      {error && !isLoading && (
        <div className="p-4 rounded-xl bg-red-50 text-red-700 text-sm border border-red-200">
          Ошибка при загрузке шаблонов. Проверьте подключение к базе данных.
        </div>
      )}

      {/* Templates Grid */}
      {!isLoading && templates && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {templates.map((tpl) => (
            <Card
              key={tpl.id}
              className={`border transition-all hover:shadow-md ${
                tpl.isDefault ? 'border-blue-400 bg-blue-50/20' : 'border-slate-200 bg-white'
              }`}
            >
              <CardHeader className="p-5 pb-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <CardTitle className="text-base font-bold text-slate-900">
                      {tpl.name}
                    </CardTitle>
                    <div className="flex items-center gap-1.5 mt-1">
                      <Badge
                        variant="secondary"
                        className="text-xs font-mono font-bold bg-slate-100 text-slate-800"
                      >
                        <Maximize2 className="w-3 h-3 mr-1 text-slate-500" />
                        {tpl.widthMm} × {tpl.heightMm} мм
                      </Badge>
                      {tpl.isDefault && (
                        <Badge
                          variant="default"
                          className="bg-blue-600 hover:bg-blue-600 text-[10px] gap-1"
                        >
                          <Star className="w-3 h-3 fill-white" />
                          Основной
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="p-5 pt-0 space-y-4">
                {/* Details summary */}
                <div className="p-3 bg-slate-50 rounded-lg text-xs space-y-1.5 text-slate-600 border border-slate-100">
                  <div className="flex justify-between">
                    <span>Магазин:</span>
                    <strong className="text-slate-800">
                      {tpl.config?.showStoreName
                        ? tpl.config.storeNameText || 'Включено'
                        : 'Выключено'}
                    </strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Штрихкод:</span>
                    <strong className="text-slate-800">
                      {tpl.config?.showBarcode ? 'Выводится' : 'Скрыт'}
                    </strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Шрифт названия / цены:</span>
                    <strong className="text-slate-800 font-mono">
                      {tpl.config?.titleFontSize || 12}pt / {tpl.config?.priceFontSize || 24}pt
                    </strong>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                  {!tpl.isDefault ? (
                    <button
                      type="button"
                      onClick={() => handleSetDefault(tpl.id, tpl.name)}
                      className="text-xs text-slate-500 hover:text-blue-600 font-medium flex items-center gap-1"
                    >
                      <Star className="w-3.5 h-3.5" />
                      Сделать основным
                    </button>
                  ) : (
                    <span className="text-xs text-blue-600 font-medium flex items-center gap-1">
                      <Sparkles className="w-3.5 h-3.5" />
                      Шаблон по умолчанию
                    </span>
                  )}

                  <div className="flex items-center gap-1">
                    <Link href={`/admin/templates/${tpl.id}`}>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 px-2 text-xs text-slate-600 hover:text-blue-600 gap-1"
                        title="Редактировать"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                        Изменить
                      </Button>
                    </Link>

                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(tpl.id, tpl.name)}
                      disabled={tpl.isDefault}
                      className="h-8 w-8 text-slate-400 hover:text-red-600 hover:bg-red-50 disabled:opacity-30"
                      title={tpl.isDefault ? 'Нельзя удалить основной шаблон' : 'Удалить'}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
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
