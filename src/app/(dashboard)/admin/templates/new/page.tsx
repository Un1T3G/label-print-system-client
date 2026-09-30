'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { useCreateTemplate } from '@/hooks/useTemplates';
import { CreatePrintTemplateDto } from '@/lib/types';
import { TemplateEditorForm } from '@/components/admin/template-editor-form';
import { toast } from 'sonner';

export default function NewTemplatePage() {
  const router = useRouter();
  const createMutation = useCreateTemplate();

  const handleCreate = async (dto: CreatePrintTemplateDto) => {
    if (!dto.name.trim()) {
      toast.error('Введите название шаблона');
      return;
    }

    try {
      await createMutation.mutateAsync(dto);
      toast.success('Шаблон успешно создан!');
      router.push('/admin/templates');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Ошибка при сохранении';
      toast.error(msg);
    }
  };

  return (
    <TemplateEditorForm
      title="Создание шаблона ценника"
      subtitle="Настройте размеры, текстовые блоки, штрихкод и параметры термопечати TSPL"
      onSubmit={handleCreate}
      isSubmitting={createMutation.isPending}
    />
  );
}
