'use client';

import { useState } from 'react';
import { usePrintCart } from '../model/print-cart-store';
import { useTemplates, type PrintTemplate } from '@/features/templates';
import { sendToLocalPrinter, sendPdfToLocalPrinter } from '../api/printer';
import { generateLabelsPdf, downloadLabelsPdf, openLabelsPdfInNewTab } from '../lib/pdf-generator';
import { toast } from 'sonner';

export function usePrintQueue() {
  const { items, totalLabelsCount, updateQuantity, removeItem, clearCart } = usePrintCart();
  const { data: templates, isLoading: isLoadingTemplates } = useTemplates();

  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('');
  const [previewItemIndex, setPreviewItemIndex] = useState<number>(0);
  const [isPrinting, setIsPrinting] = useState(false);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [isSendingPdf, setIsSendingPdf] = useState(false);
  const [isTsplModalOpen, setIsTsplModalOpen] = useState(false);

  // Active template resolution: user-selected -> default -> first available
  const activeTemplate: PrintTemplate | undefined =
    templates?.find((t) => t.id === selectedTemplateId) ||
    templates?.find((t) => t.isDefault) ||
    templates?.[0];

  const previewItem = items[previewItemIndex] || items[0];

  const handlePrint = async () => {
    if (items.length === 0) {
      toast.warning('Очередь печати пуста. Добавьте товары из каталога.');
      return;
    }

    if (!activeTemplate) {
      toast.error('Не выбран шаблон печати. Создайте или выберите шаблон.');
      return;
    }

    setIsPrinting(true);

    try {
      const payload = {
        template: activeTemplate,
        items: items.map((item) => ({
          barcode: item.barcode,
          name: item.name,
          price: item.price,
          measureName: item.measureName,
          quantity: item.quantity,
        })),
      };

      await sendToLocalPrinter(payload);

      toast.success(
        `Задание отправлено на печать: ${totalLabelsCount} ценников (${items.length} позиций)!`
      );
    } catch (err: unknown) {
      const msg =
        err instanceof Error
          ? err.message
          : 'Сбой соединения с локальным сервисом печати (http://localhost:9100/print)';
      toast.error(msg, {
        duration: 7000,
        description:
          'Убедитесь, что сервис печати запущен на локальном компьютере и порт 9100 открыт.',
      });
    } finally {
      setIsPrinting(false);
    }
  };

  const handleBrowserPrint = async () => {
    if (items.length === 0) {
      toast.warning('Очередь печати пуста.');
      return;
    }
    if (!activeTemplate) {
      toast.error('Не выбран шаблон печати.');
      return;
    }

    setIsGeneratingPdf(true);
    try {
      toast.info('Подготовка документа к печати...');
      const doc = await generateLabelsPdf({ template: activeTemplate, items });
      doc.autoPrint();
      const pdfBlobUrl = doc.output('bloburl');
      window.open(pdfBlobUrl, '_blank');
      toast.success('Открыто системное окно печати Windows / браузера');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Ошибка формирования печати';
      toast.error(msg);
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  const handleDownloadPdf = async () => {
    if (items.length === 0 || !activeTemplate) return;
    setIsGeneratingPdf(true);
    try {
      await downloadLabelsPdf({ template: activeTemplate, items });
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
      await openLabelsPdfInNewTab({ template: activeTemplate, items });
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
      const doc = await generateLabelsPdf({ template: activeTemplate, items });
      const rawUri = doc.output('datauristring');
      const pdfBase64 = rawUri.includes('base64,') ? rawUri.split('base64,')[1] : rawUri;

      const result = await sendPdfToLocalPrinter({
        pdfBase64,
        filename: `labels_${activeTemplate.widthMm}x${activeTemplate.heightMm}.pdf`,
      });

      toast.success(
        result.message || 'PDF файл успешно отправлен на печать в сервис (порт 9100)!'
      );
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Ошибка отправки PDF в сервис печати';
      toast.error(msg);
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
