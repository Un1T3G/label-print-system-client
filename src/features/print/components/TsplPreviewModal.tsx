'use client';

import React, { useState, useEffect } from 'react';
import { fetchTsplPreview, fetchPrinterStatus, getPrinterBaseUrl } from '../api/printer';
import { usePrinterSettingsStore } from '../model/printer-settings-store';
import type { PrinterStatus } from '../types';
import {
  Button,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  Alert,
  AlertTitle,
  AlertDescription,
  Badge,
} from '@/shared/ui';
import { Terminal, Copy, Check, ExternalLink, Download, RefreshCw, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

export interface TsplPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function TsplPreviewModal({ isOpen, onClose }: TsplPreviewModalProps) {
  const [tsplCode, setTsplCode] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [serviceStatus, setServiceStatus] = useState<PrinterStatus | null>(null);
  const serverUrl = usePrinterSettingsStore((s) => s.serverUrl) || getPrinterBaseUrl();

  const loadData = React.useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [tspl, status] = await Promise.allSettled([
        fetchTsplPreview(),
        fetchPrinterStatus(),
      ]);

      if (status.status === 'fulfilled') {
        setServiceStatus(status.value);
      }

      if (tspl.status === 'fulfilled') {
        setTsplCode(tspl.value);
      } else {
        const reason = tspl.reason as Error;
        setError(reason?.message || 'Не удалось получить TSPL команды');
      }
    } catch {
      setError('Не удалось связаться с печатным сервисом');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    let ignore = false;
    if (isOpen) {
      Promise.resolve().then(() => {
        if (!ignore) {
          loadData();
        }
      });
    }
    return () => {
      ignore = true;
    };
  }, [isOpen, loadData]);

  const handleCopy = () => {
    if (!tsplCode) return;
    navigator.clipboard.writeText(tsplCode);
    setCopied(true);
    toast.success('TSPL код скопирован в буфер обмена');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    if (!tsplCode) return;
    const blob = new Blob([tsplCode], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `job_${Date.now()}.tspl`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Файл .tspl скачан');
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="w-full sm:max-w-4xl max-h-[85vh] flex flex-col p-0 overflow-hidden gap-0">
        {/* Header */}
        <DialogHeader className="px-6 py-4 pr-14 border-b border-border bg-muted/30 flex-row items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="size-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
              <Terminal className="size-5" />
            </div>
            <div>
              <DialogTitle className="text-base font-semibold flex items-center gap-2">
                Команды TSPL последнего задания
                {serviceStatus && (
                  <Badge variant="outline" className="text-xs font-normal">
                    Сервис активен ({serviceStatus.version})
                  </Badge>
                )}
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground">
                Низкоуровневые байты, переданные в термоголовку принтера
              </DialogDescription>
            </div>
          </div>

          <Button
            variant="ghost"
            size="icon-xs"
            onClick={loadData}
            disabled={isLoading}
            className="text-muted-foreground"
            title="Обновить"
          >
            <RefreshCw className={isLoading ? 'animate-spin' : ''} />
          </Button>
        </DialogHeader>


        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-4">
          {serviceStatus && (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-3 rounded-xl bg-muted/40 border border-border text-xs">
              <div>
                <span className="text-muted-foreground">Принтер в Windows:</span>
                <p className="font-medium text-foreground truncate">
                  {serviceStatus.activePrinter || 'По умолчанию'}
                </p>
              </div>
              <div>
                <span className="text-muted-foreground">Эндпоинт:</span>
                <p className="font-mono text-foreground truncate">{serverUrl}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Статус сервиса:</span>
                <p className="text-emerald-500 font-medium">Работает (порт 9100)</p>
              </div>
            </div>
          )}

          {error ? (
            <Alert variant="destructive">
              <AlertCircle />
              <AlertTitle>{error}</AlertTitle>
              <AlertDescription>
                Убедитесь, что приложение печати запущено на этом компьютере:{' '}
                <code className="mx-1 px-1.5 py-0.5 rounded bg-muted font-mono text-xs">
                  npm run start
                </code>{' '}
                в папке desktop-print-service.
              </AlertDescription>
            </Alert>
          ) : (
            <div className="relative">
              <pre className="p-4 rounded-xl bg-muted/60 border border-border font-mono text-xs text-primary leading-relaxed overflow-x-auto max-h-[420px]">
                {tsplCode || (isLoading ? 'Загрузка...' : '// Нет доступных TSPL команд')}
              </pre>
            </div>
          )}
        </div>

        {/* Footer */}
        <DialogFooter className="px-6 py-3 border-t border-border bg-muted/30 flex items-center justify-between sm:justify-between">
          <div className="flex items-center gap-2">
            <a
              href={`${serverUrl}/status`}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
            >
              Диагностика сервиса <ExternalLink className="size-3" />
            </a>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleDownload}
              disabled={!tsplCode}
            >
              <Download data-icon="inline-start" />
              Скачать .tspl
            </Button>
            <Button
              variant="default"
              size="sm"
              onClick={handleCopy}
              disabled={!tsplCode}
            >
              {copied ? (
                <>
                  <Check data-icon="inline-start" />
                  Скопировано
                </>
              ) : (
                <>
                  <Copy data-icon="inline-start" />
                  Копировать TSPL
                </>
              )}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
