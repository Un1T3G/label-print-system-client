'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePrintQueue } from '../hooks/use-print-queue';
import { Button } from '@/shared/ui';
import { TsplPreviewModal } from './TsplPreviewModal';
import { PrinterSettingsModal } from './PrinterSettingsModal';
import { ArrowLeft, Trash2, Settings2 } from 'lucide-react';
import {
  PrintQueueEmptyState,
  PrintQueueItemList,
  PrintPreviewCard,
  PrintActionsCard,
} from './queue';

export function PrintQueuePage() {
  const {
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
    isSendingPdf,
    isTsplModalOpen,
    setIsTsplModalOpen,
    handleBrowserPrint,
    handleSendPdfToService,
  } = usePrintQueue();

  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);

  return (
    <div className="flex flex-col gap-4 sm:gap-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Link
            href="/products"
            className="text-muted-foreground hover:text-foreground transition-colors p-1.5 -ml-1.5 rounded-md active:bg-muted/60"
          >
            <ArrowLeft className="size-5" />
          </Link>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
              Очередь печати
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground hidden sm:block mt-0.5">
              Настройте шаблон, проверьте количество и отправьте ценники на принтер
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsSettingsModalOpen(true)}
            className="gap-1.5 font-medium"
            title="Настройка IP-адреса сервиса печати"
          >
            <Settings2 className="size-3.5" />
            <span className="hidden sm:inline">Сервер печати (IP)</span>
            <span className="sm:hidden">IP принтера</span>
          </Button>

          {items.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearCart}
              className="text-destructive hover:bg-destructive/10 hover:text-destructive shrink-0"
            >
              <Trash2 data-icon="inline-start" />
              <span className="hidden sm:inline">Очистить всю</span>
            </Button>
          )}
        </div>
      </div>

      {items.length === 0 ? (
        <PrintQueueEmptyState />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column: Items List */}
          <div className="lg:col-span-7 flex flex-col gap-4">
            <PrintQueueItemList
              items={items}
              totalLabelsCount={totalLabelsCount}
              currencySymbol={activeTemplate?.config?.currencySymbol}
              previewItemIndex={previewItemIndex}
              getItemTemplate={getItemTemplate}
              onSelectPreviewItem={setPreviewItemIndex}
              onUpdateQuantity={updateQuantity}
              onRemoveItem={removeItem}
            />
          </div>

          {/* Right Column: Template selection, Preview & Actions */}
          <div className="lg:col-span-5 flex flex-col gap-5">
            <PrintPreviewCard
              templates={templates}
              isLoadingTemplates={isLoadingTemplates}
              activeTemplate={activeTemplate}
              previewItem={previewItem}
              selectedTemplateId={selectedTemplateId}
              onSelectTemplateId={setSelectedTemplateId}
              onOpenTsplModal={() => setIsTsplModalOpen(true)}
            />

            <PrintActionsCard
              totalLabelsCount={totalLabelsCount}
              itemsCount={items.length}
              activeTemplate={activeTemplate}
              isSendingPdf={isSendingPdf}
              onSendPdfToService={handleSendPdfToService}
              onBrowserPrint={handleBrowserPrint}
              onOpenSettings={() => setIsSettingsModalOpen(true)}
            />
          </div>
        </div>
      )}

      {/* TSPL Live Preview Modal */}
      <TsplPreviewModal
        isOpen={isTsplModalOpen}
        onClose={() => setIsTsplModalOpen(false)}
      />

      {/* Printer Server IP Settings Modal */}
      <PrinterSettingsModal
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
      />
    </div>
  );
}
