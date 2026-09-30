'use client';

import React from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { useTemplate, useUpdateTemplate } from '@/hooks/useTemplates';
import { CreatePrintTemplateDto } from '@/lib/types';
import { TemplateEditorForm } from '@/components/admin/template-editor-form';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

export default function EditTemplatePage() {
  const router = useRouter();
  const params = useParams();
  const templateId = params?.id as string;

  const { data: template, isLoading, error } = useTemplate(templateId);
  const updateMutation = useUpdateTemplate();

  const handleUpdate = async (dto: CreatePrintTemplateDto) => {
    try {
      await updateMutation.mutateAsync({
        id: templateId,
        dto,
      });
      toast.success('Шаблон успешно сохранен!');
      router.push('/admin/templates');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Ошибка при сохранении';
      toast.error(msg);
    }
  };

  if (isLoading) {
    return (
      <div className="p-12 text-center text-slate-500 flex flex-col items-center gap-2">
        <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
        <span className="text-xs">Загрузка параметров шаблона...</span>
      </div>
    );
  }

  if (error || !template) {
    return (
      <div className="p-12 text-center space-y-3">
        <h2 className="text-lg font-bold text-slate-800">Шаблон не найден</h2>
        <Link href="/admin/templates">
          <Button variant="outline">Вернуться к списку</Button>
        </Link>
      </div>
    );
  }

  return (
    <TemplateEditorForm
      title={`Редактирование шаблона «${template.name}»`}
      subtitle="Изменение размеров, оформления текста, штрихкода и параметров TSPL"
      initialName={template.name}
      initialWidthMm={template.widthMm}
      initialHeightMm={template.heightMm}
      initialIsDefault={template.isDefault}
      initialConfig={template.config}
      onSubmit={handleUpdate}
      isSubmitting={updateMutation.isPending}
    />
  );
}
