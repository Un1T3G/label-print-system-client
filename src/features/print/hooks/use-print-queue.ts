'use client';

import { useState } from 'react';
import { usePrintCart } from '../model/print-cart-store';
import { useTemplates, resolveItemTemplate, type PrintTemplate } from '@/features/templates';
import { sendToLocalPrinter, sendPdfToLocalPrinter } from '../api/printer';
import {
  generateLabelsPdf,
  downloadLabelsPdf,
  openLabelsPdfInNewTab,
  printViaBrowser,
} from '../lib/pdf-generator';
import type { PrintJobItem } from '../types';
import { toast } from 'sonner';

export function usePrintQueue() {
  const { items, totalLabelsCount, updateQuantity, removeItem, clearCart } = usePrintCart();
  const { data: templates, isLoading: isLoadingTemplates } = useTemplates();

  // 'auto' is default for smart routing (piece vs weight), or specific template ID
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('auto');
  const [previewItemIndex, setPreviewItemIndex] = useState<number>(0);
  const [isPrinting, setIsPrinting] = useState(false);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [isSendingPdf, setIsSendingPdf] = useState(false);
  const [isTsplModalOpen, setIsTsplModalOpen] = useState(false);

  // Helper to resolve template for a specific item
  const getItemTemplate = (item: PrintJobItem): PrintTemplate => {
    return (
      resolveItemTemplate(item, templates, selectedTemplateId) ||
      templates?.find((t) => t.isDefault) ||
      templates?.[0]!
    );
  };

  const previewItem = items[previewItemIndex] || items[0];

  // Active template resolution for the currently selected preview item
  const activeTemplate: PrintTemplate | undefined = previewItem
    ? getItemTemplate(previewItem)
    : templates?.find((t) => t.isDefault) || templates?.[0];

  const handlePrint = async () => {
    if (items.length === 0) {
      toast.warning('Очередь печати пуста. Добавьте товары из каталога.');
      return;
    }

    if (!templates || templates.length === 0) {
      toast.error('Не найдены шаблоны печати.');
      return;
    }

    setIsPrinting(true);

    try {
      // Group items by their resolved template (for smooth batch printing)
      const groups = new Map<string, { template: PrintTemplate; items: PrintJobItem[] }>();

      for (const item of items) {
        const tpl = getItemTemplate(item);
        if (!tpl) continue;
        const existing = groups.get(tpl.id);
        if (existing) {
          existing.items.push(item);
        } else {
          groups.set(tpl.id, { template: tpl, items: [item] });
        }
      }

      for (const group of groups.values()) {
        const payload = {
          template: group.template,
          items: group.items.map((item) => ({
            barcode: item.barcode,
            name: item.name,
            price: item.price,
            measureName: item.measureName,
            quantity: item.quantity,
            plu: item.plu,
            isWeight: item.isWeight,
          })),
        };
        await sendToLocalPrinter(payload);
      }

      toast.success(
        `Задание отправлено на печать: ${totalLabelsCount} ценников (${items.length} позиций)!`
      );
    } catch (err: unknown) {
      const msg =
        err instanceof Error
          ? err.message
          : 'Сбой соединения с сервисом печати';
      toast.error(msg, {
        duration: 7000,
        description:
          'Проверьте IP-адрес сервиса печати в настройках и убедитесь, что компьютер и телефон в одной сети Wi-Fi.',
      });
    } finally {
      setIsPrinting(false);
    }
  };

  const handleBrowserPrint = () => {
    if (items.length === 0) {
      toast.warning('Очередь печати пуста.');
      return;
    }
    if (!activeTemplate) {
      toast.error('Не выбран шаблон печати.');
      return;
    }

    try {
      printViaBrowser(activeTemplate, items, (item) => getItemTemplate(item));
      toast.success('Открыт системный диалог печати Windows', {
        description: 'Совет: выберите поля «Отсутствуют» (None) для 100% точного размера термоэтикетки.',
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Ошибка формирования печати';
      toast.error(msg);
    }
  };

  const handleDownloadPdf = async () => {
    if (items.length === 0 || !activeTemplate) return;
    setIsGeneratingPdf(true);
    try {
      await downloadLabelsPdf({
        template: activeTemplate,
        items,
        resolveTemplate: (item) => getItemTemplate(item),
      });
      toast.success('PDF файл с ценниками успешно сгенерирован и скачан');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Ошибка создания PDF';
      toast.error(msg);
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  const handleOpenPdf = async () => {
    if (items.length === 0 || !activeTemplate) return;
    setIsGeneratingPdf(true);
    try {
      await openLabelsPdfInNewTab({
        template: activeTemplate,
        items,
        resolveTemplate: (item) => getItemTemplate(item),
      });
      toast.success('PDF открыт в новой вкладке для просмотра и печати');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Ошибка создания PDF';
      toast.error(msg);
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  const handleSendPdfToService = async () => {
    if (items.length === 0) {
      toast.warning('Очередь печати пуста. Добавьте товары из каталога.');
      return;
    }
    if (!activeTemplate) {
      toast.error('Не выбран шаблон печати.');
      return;
    }

    setIsSendingPdf(true);
    try {
      toast.info('Формирование PDF документа для сервиса печати...');
      const doc = await generateLabelsPdf({
        template: activeTemplate,
        items,
        resolveTemplate: (item) => getItemTemplate(item),
      });
      const rawUri = doc.output('datauristring');
      const pdfBase64 = rawUri.includes('base64,') ? rawUri.split('base64,')[1] : rawUri;

      const result = await sendPdfToLocalPrinter({
        pdfBase64,
        filename: `labels_${activeTemplate.widthMm}x${activeTemplate.heightMm}.pdf`,
      });

      toast.success(
        result.message || 'PDF файл успешно отправлен на печать!'
      );
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Ошибка отправки PDF в сервис печати';
      toast.error(msg, {
        duration: 7000,
        description: 'Проверьте настройки IP-адреса принтера и работу сервиса печати на компьютере.',
      });
    } finally {
      setIsSendingPdf(false);
    }
  };

  return {
    items,
    totalLabelsCount,
    updateQuantity,
    removeItem,
    clearCart,
    templates,
    isLoadingTemplates,
    selectedTemplateId,
    setSelectedTemplateId,
    previewItemIndex,
    setPreviewItemIndex,
    activeTemplate,
    previewItem,
    getItemTemplate,
    isPrinting,
    isGeneratingPdf,
    isSendingPdf,
    isTsplModalOpen,
    setIsTsplModalOpen,
    handlePrint,
    handleBrowserPrint,
    handleDownloadPdf,
    handleOpenPdf,
    handleSendPdfToService,
  };
}

