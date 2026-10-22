'use client';

import React from 'react';
import type { PrintTemplate } from '@/features/templates';
import { Button, Card, CardContent, Separator } from '@/shared/ui';
import { Send, Printer, Loader2, Settings2, Wifi } from 'lucide-react';
import { usePrinterSettingsStore } from '../../model/printer-settings-store';

interface PrintActionsCardProps {
  totalLabelsCount: number;
  itemsCount: number;
  activeTemplate?: PrintTemplate;
  isSendingPdf: boolean;
  onSendPdfToService: () => void;
  onBrowserPrint: () => void;
  onOpenSettings?: () => void;
}

export function PrintActionsCard({
  totalLabelsCount,
  itemsCount,
  activeTemplate,
  isSendingPdf,
  onSendPdfToService,
  onBrowserPrint,
  onOpenSettings,
}: PrintActionsCardProps) {
  const isActionDisabled = itemsCount === 0 || !activeTemplate;
  const serverUrl = usePrinterSettingsStore((s) => s.serverUrl);

  // Выделяем хост для короткого отображения (например "192.168.0.15:9100")
  const displayHost = serverUrl.replace(/^https?:\/\//i, '');

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

        {/* Server IP info bar */}
        <div className="flex items-center justify-between gap-2 px-3 py-2 rounded-lg bg-muted/60 border border-border text-xs">
          <div className="flex items-center gap-2 min-w-0">
            <Wifi className="size-3.5 text-primary shrink-0" />
            <div className="min-w-0">
              <span className="text-[10px] text-muted-foreground block leading-tight">IP принтера:</span>
              <span className="font-mono text-xs font-semibold text-foreground truncate block leading-tight">
                {displayHost}
              </span>
            </div>
          </div>
          {onOpenSettings && (
            <Button
              type="button"
              variant="outline"
              size="xs"
              onClick={onOpenSettings}
              className="h-7 text-xs px-2 shrink-0 gap-1 border-border/80"
            >
              <Settings2 className="size-3.5" />
              <span>Сменить IP</span>
            </Button>
          )}
        </div>

        {/* Send PDF to local print service */}
        <Button
          onClick={onSendPdfToService}
          disabled={isSendingPdf || isActionDisabled}
          size="lg"
          className="w-full font-semibold shadow-xs"
        >
          {isSendingPdf ? (
            <Loader2 data-icon="inline-start" className="animate-spin" />
          ) : (
            <Send data-icon="inline-start" />
          )}
          <span className="sm:hidden">{isSendingPdf ? 'Отправка...' : 'Отправить на принтер'}</span>
          <span className="hidden sm:inline">
            {isSendingPdf ? 'Отправка PDF в сервис...' : `Отправить PDF на принтер (${displayHost})`}
          </span>
        </Button>

        {/* Direct Print via browser dialog */}
        <Button
          type="button"
          variant="secondary"
          size="default"
          onClick={onBrowserPrint}
          disabled={isActionDisabled}
          className="w-full font-medium"
        >
          <Printer data-icon="inline-start" />
          <span className="sm:hidden">Печать через браузер</span>
          <span className="hidden sm:inline">Печать через диалог Windows / браузера</span>
        </Button>
      </CardContent>
    </Card>
  );
}
