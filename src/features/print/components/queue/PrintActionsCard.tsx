'use client';

import React from 'react';
import type { PrintTemplate } from '@/features/templates';
import { Button, Card, CardContent, Separator } from '@/shared/ui';
import { Send, Printer, Loader2 } from 'lucide-react';

interface PrintActionsCardProps {
  totalLabelsCount: number;
  itemsCount: number;
  activeTemplate?: PrintTemplate;
  isSendingPdf: boolean;
  onSendPdfToService: () => void;
  onBrowserPrint: () => void;
}

export function PrintActionsCard({
  totalLabelsCount,
  itemsCount,
  activeTemplate,
  isSendingPdf,
  onSendPdfToService,
  onBrowserPrint,
}: PrintActionsCardProps) {
  const isActionDisabled = itemsCount === 0 || !activeTemplate;

  return (
    <Card className="shadow-sm">
      <CardContent className="p-4 sm:p-5 flex flex-col gap-3 sm:gap-4">
        <div className="flex items-center justify-between text-sm pb-1">
          <span className="text-muted-foreground font-medium">Всего к печати:</span>
          <span className="text-3xl sm:text-2xl font-black text-primary">
            {totalLabelsCount} шт.
          </span>
        </div>

        <Separator />

        {/* Send PDF to local print service (port 9100) */}
        <Button
          onClick={onSendPdfToService}
          disabled={isSendingPdf || isActionDisabled}
          className="w-full h-14 sm:h-11 text-base sm:text-sm font-semibold shadow-xs"
        >
          {isSendingPdf ? (
            <Loader2 data-icon="inline-start" className="animate-spin" />
          ) : (
            <Send data-icon="inline-start" />
          )}
          <span className="sm:hidden">{isSendingPdf ? 'Отправка...' : 'Отправить на принтер'}</span>
          <span className="hidden sm:inline">{isSendingPdf ? 'Отправка PDF в сервис...' : 'Отправить PDF на принтер (сервис 9100)'}</span>
        </Button>

        {/* Direct Print via browser dialog */}
        <Button
          type="button"
          variant="secondary"
          onClick={onBrowserPrint}
          disabled={isActionDisabled}
          className="w-full h-11 sm:h-10 text-sm sm:text-xs font-medium"
        >
          <Printer data-icon="inline-start" />
          <span className="sm:hidden">Печать через браузер</span>
          <span className="hidden sm:inline">Печать через диалог Windows / браузера</span>
        </Button>
      </CardContent>
    </Card>
  );
}
