import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiFetch } from '@/lib/fetcher';
import { PrintTemplate, CreatePrintTemplateDto } from '@/lib/types';

// Загрузка списка шаблонов
export function useTemplates() {
  return useQuery({
    queryKey: ['print-templates'],
    queryFn: () => apiFetch<PrintTemplate[]>('/api/admin/templates'),
  });
}

// Загрузка одного шаблона
export function useTemplate(id: string) {
  return useQuery({
    queryKey: ['print-template', id],
    queryFn: () => apiFetch<PrintTemplate>(`/api/admin/templates/${id}`),
    enabled: Boolean(id),
  });
}

// Создание шаблона в админке
export function useCreateTemplate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (dto: CreatePrintTemplateDto) =>
      apiFetch<PrintTemplate>('/api/admin/templates', {
        method: 'POST',
        body: JSON.stringify(dto),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['print-templates'] });
    },
  });
}

// Обновление шаблона
export function useUpdateTemplate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: Partial<CreatePrintTemplateDto> }) =>
      apiFetch<PrintTemplate>(`/api/admin/templates/${id}`, {
        method: 'PUT',
        body: JSON.stringify(dto),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['print-templates'] });
    },
  });
}

// Удаление шаблона
export function useDeleteTemplate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) =>
      apiFetch<{ success: boolean }>(`/api/admin/templates/${id}`, {
        method: 'DELETE',
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['print-templates'] });
    },
  });
}
