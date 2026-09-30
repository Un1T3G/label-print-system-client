'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePrintCart } from '@/context/print-cart-context';
import { useTemplates } from '@/hooks/useTemplates';
import { sendToLocalPrinter, sendPdfToLocalPrinter } from '@/lib/printer';
import { PrintTemplate } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { LabelLivePreview } from '@/components/admin/label-live-preview';
import { TsplPreviewModal } from '@/components/print/tspl-preview-modal';
import {
  downloadLabelsPdf,
  openLabelsPdfInNewTab,
  printViaBrowser,
  generateLabelsPdf,
} from '@/lib/pdf-generator';
import {
  Printer,
  Trash2,
  Plus,
  Minus,
  ArrowLeft,
  CheckCircle2,
  AlertTriangle,
  Sliders,
  Eye,
  Layers,
  Terminal,
  FileDown,
  ExternalLink,
  Send,
} from 'lucide-react';
import { toast } from 'sonner';

export default function PrintQueuePage() {
  const { items, updateQuantity, removeItem, clearCart, totalLabelsCount } = usePrintCart();
  const { data: templates, isLoading: isLoadingTemplates } = useTemplates();

  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('');
  const [isPrinting, setIsPrinting] = useState(false);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [isSendingPdf, setIsSendingPdf] = useState(false);
  const [previewItemIndex, setPreviewItemIndex] = useState(0);
  const [isTsplModalOpen, setIsTsplModalOpen] = useState(false);

  // Pick default template if none selected yet
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

  const handleBrowserPrint = () => {
    if (items.length === 0) {
      toast.warning('Очередь печати пуста. Добавьте товары из каталога.');
      return;
    }
    if (!activeTemplate) {
      toast.error('Не выбран шаблон печати.');
      return;
    }

    try {
      printViaBrowser(activeTemplate, items);
      toast.success('Подготовлен документ и открыт диалог печати Windows / PDF');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Ошибка формирования печати';
      toast.error(msg);
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Link
              href="/products"
              className="text-slate-400 hover:text-slate-700 transition-colors p-1 -ml-1 rounded-md"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              Очередь печати ценников
            </h1>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            Настройте шаблон, проверьте количество и отправьте ценники на локальный принтер
          </p>
        </div>

        {items.length > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearCart}
            className="text-red-600 hover:bg-red-50 hover:text-red-700 text-xs gap-1.5 self-start sm:self-auto"
          >
            <Trash2 className="w-3.5 h-3.5" />
            Очистить всю очередь
          </Button>
        )}
      </div>

      {items.length === 0 ? (
        /* Empty Queue State */
        <Card className="border-dashed border-slate-300 bg-white">
          <CardContent className="py-20 text-center space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto">
              <Printer className="w-7 h-7" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-900 text-lg">
                Очередь печати пуста
              </h3>
              <p className="text-sm text-slate-500 max-w-md mx-auto mt-1">
                Перейдите в каталог товаров и добавьте необходимые позиции кнопкой «+ В очередь»
              </p>
            </div>
            <Link href="/products">
              <Button className="mt-2 bg-blue-600 hover:bg-blue-700 text-white">
                Перейти в каталог товаров
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        /* Two-column layout: Items Queue on left, Template selector & Live Preview on right */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Items Table */}
          <div className="lg:col-span-7 space-y-4">
            <Card className="border-slate-200 shadow-sm bg-white">
              <CardHeader className="p-4 sm:p-5 border-b border-slate-100 flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-base">Позиции к печати</CardTitle>
                  <CardDescription className="text-xs">
                    {items.length} уникальных позиций, всего {totalLabelsCount} шт. ценников
                  </CardDescription>
                </div>
                <Badge variant="secondary" className="font-mono text-xs">
                  {totalLabelsCount} ценников
                </Badge>
              </CardHeader>
              <CardContent className="p-0">
                <div className="divide-y divide-slate-100">
                  {items.map((item, index) => (
                    <div
                      key={item.barcode}
                      className={`p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-colors ${
                        previewItemIndex === index ? 'bg-blue-50/40' : 'hover:bg-slate-50/60'
                      }`}
                    >
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-[11px] font-mono text-slate-400">
                            #{item.barcode}
                          </span>
                          <span className="text-[11px] text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">
                            {item.measureName}
                          </span>
                        </div>
                        <h4 className="font-semibold text-slate-900 text-sm leading-snug">
                          {item.name}
                        </h4>
                        <div className="text-sm font-bold text-slate-900">
                          {item.price.toLocaleString('ru-RU')} {activeTemplate?.config?.currencySymbol || 'сум'}
                        </div>
                      </div>

                      <div className="flex items-center justify-between sm:justify-end gap-3 pt-2 sm:pt-0 border-t sm:border-0 border-slate-100">
                        {/* Preview button */}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setPreviewItemIndex(index)}
                          className={`h-8 px-2 text-xs gap-1 ${
                            previewItemIndex === index
                              ? 'text-blue-600 bg-blue-100/60 font-semibold'
                              : 'text-slate-500'
                          }`}
                          title="Посмотреть предпросмотр этого ценника"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span className="hidden sm:inline">Превью</span>
                        </Button>

                        {/* Quantity Controls */}
                        <div className="flex items-center border border-slate-200 rounded-lg bg-white overflow-hidden shadow-2xs">
                          <button
                            type="button"
                            onClick={() => updateQuantity(item.barcode, item.quantity - 1)}
                            className="w-8 h-8 flex items-center justify-center text-slate-600 hover:bg-slate-100 active:bg-slate-200 transition"
                            title="Уменьшить"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <input
                            type="number"
                            min="1"
                            value={item.quantity}
                            onChange={(e) => {
                              const val = parseInt(e.target.value, 10);
                              if (!isNaN(val)) updateQuantity(item.barcode, Math.max(1, val));
                            }}
                            className="w-12 text-center text-xs font-bold text-slate-900 focus:outline-none"
                          />
                          <button
                            type="button"
                            onClick={() => updateQuantity(item.barcode, item.quantity + 1)}
                            className="w-8 h-8 flex items-center justify-center text-slate-600 hover:bg-slate-100 active:bg-slate-200 transition"
                            title="Увеличить"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>

                        {/* Remove item button */}
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => removeItem(item.barcode)}
                          className="h-8 w-8 text-slate-400 hover:text-red-600 hover:bg-red-50"
                          title="Удалить из очереди"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column: Template selection, Live Preview & Print trigger */}
          <div className="lg:col-span-5 space-y-5">
            {/* Template Selection Card */}
            <Card className="border-slate-200 shadow-sm bg-white">
              <CardHeader className="p-4 sm:p-5 pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Sliders className="w-4 h-4 text-blue-600" />
                    Шаблон ценника
                  </CardTitle>
                  <Link
                    href="/admin/templates/new"
                    className="text-xs text-blue-600 hover:underline font-medium"
                  >
                    + Создать шаблон
                  </Link>
                </div>
                <CardDescription className="text-xs">
                  Выберите шаблон для печати текущего пакета ценников
                </CardDescription>
              </CardHeader>
              <CardContent className="p-4 sm:p-5 pt-0 space-y-3">
                {isLoadingTemplates ? (
                  <div className="h-10 bg-slate-100 rounded-lg animate-pulse" />
                ) : (
                  <select
                    value={activeTemplate?.id || ''}
                    onChange={(e) => setSelectedTemplateId(e.target.value)}
                    className="w-full h-10 px-3 rounded-lg border border-slate-300 bg-white text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {templates?.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.name} ({t.widthMm}×{t.heightMm} мм)
                        {t.isDefault ? ' [По умолчанию]' : ''}
                      </option>
                    ))}
                  </select>
                )}

                {activeTemplate && (
                  <div className="p-3 bg-slate-50 rounded-lg border border-slate-200/80 text-xs space-y-1 text-slate-600">
                    <div className="flex justify-between">
                      <span>Физический размер:</span>
                      <strong className="text-slate-800">
                        {activeTemplate.widthMm} × {activeTemplate.heightMm} мм
                      </strong>
                    </div>
                    <div className="flex justify-between">
                      <span>Магазин:</span>
                      <strong className="text-slate-800">
                        {activeTemplate.config.showStoreName
                          ? activeTemplate.config.storeNameText || 'Alpamis'
                          : 'Скрыт'}
                      </strong>
                    </div>
                    <div className="flex justify-between">
                      <span>Штрихкод:</span>
                      <strong className="text-slate-800">
                        {activeTemplate.config.showBarcode ? 'Да' : 'Нет'}
                      </strong>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Live Preview Card */}
            <Card className="border-slate-200 shadow-sm bg-white">
              <CardHeader className="p-4 sm:p-5 pb-2 flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Eye className="w-4 h-4 text-emerald-600" />
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
                  onClick={() => setIsTsplModalOpen(true)}
                  className="h-8 text-xs gap-1.5 border-slate-300 hover:border-blue-400 hover:bg-blue-50 text-slate-700 font-medium"
                  title="Посмотреть сгенерированные TSPL команды (localhost:9100/preview-tspl)"
                >
                  <Terminal className="w-3.5 h-3.5 text-blue-600" />
                  TSPL код
                </Button>
              </CardHeader>
              <CardContent className="p-4 sm:p-5 pt-0">
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
                            }
                          : undefined
                      }
                      isInteractive={false}
                    />
                  ) : (
                    <div className="text-xs text-slate-400">Выберите шаблон для предпросмотра</div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Print Action Card */}
            <Card className="border-blue-200 bg-white shadow-md">
              <CardContent className="p-5 space-y-4">
                <div className="flex items-center justify-between text-sm pb-2 border-b border-slate-100">
                  <span className="text-slate-600 font-medium">Всего ценников к печати:</span>
                  <span className="text-2xl font-black text-blue-700">
                    {totalLabelsCount} шт.
                  </span>
                </div>

                {/* Button 1: Send PDF directly to local print service (port 9100) */}
                <Button
                  onClick={handleSendPdfToService}
                  disabled={isSendingPdf || items.length === 0 || !activeTemplate}
                  className="w-full h-12 text-sm font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-500/25 gap-2 transition-all active:scale-[0.99]"
                >
                  <Send className={`w-4 h-4 ${isSendingPdf ? 'animate-bounce' : ''}`} />
                  {isSendingPdf ? 'Отправка PDF в сервис...' : 'Отправить PDF на принтер (сервис 9100)'}
                </Button>

                {/* Button 2: Direct Print via Windows / Browser Print Dialog */}
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleBrowserPrint}
                  disabled={items.length === 0 || !activeTemplate}
                  className="w-full h-10 text-xs font-bold border-blue-300 bg-blue-50/60 hover:bg-blue-100/70 text-blue-900 gap-2"
                >
                  <Printer className="w-4 h-4 text-blue-600" />
                  Печать через диалог Windows / браузера
                </Button>

                {/* PDF Actions: Download PDF & Open in New Tab */}
                <div className="grid grid-cols-2 gap-2 pt-1">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleDownloadPdf}
                    disabled={isGeneratingPdf || items.length === 0 || !activeTemplate}
                    className="h-9 text-xs font-semibold border-slate-300 hover:border-blue-500 hover:bg-blue-50 text-slate-800 gap-1.5"
                  >
                    <FileDown className="w-4 h-4 text-blue-600" />
                    {isGeneratingPdf ? 'Создание PDF...' : 'Скачать PDF файл'}
                  </Button>

                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleOpenPdf}
                    disabled={isGeneratingPdf || items.length === 0 || !activeTemplate}
                    className="h-9 text-xs font-semibold border-slate-300 hover:border-blue-500 hover:bg-blue-50 text-slate-800 gap-1.5"
                  >
                    <ExternalLink className="w-4 h-4 text-slate-600" />
                    {isGeneratingPdf ? 'Загрузка...' : 'Открыть PDF'}
                  </Button>
                </div>

                {/* Secondary TSPL Send Option */}
                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                  <span className="text-[11px]">Альтернатива (сырой TSPL):</span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={handlePrint}
                    disabled={isPrinting || items.length === 0}
                    className="h-7 px-2 text-[11px] text-slate-600 hover:text-blue-700 hover:bg-slate-100 gap-1"
                  >
                    <Terminal className="w-3 h-3 text-slate-400" />
                    {isPrinting ? 'Отправка...' : 'Отправить через TSPL'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* TSPL Live Preview Modal */}
      <TsplPreviewModal
        isOpen={isTsplModalOpen}
        onClose={() => setIsTsplModalOpen(false)}
      />
    </div>
  );
}
