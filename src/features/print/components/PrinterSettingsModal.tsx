'use client';

import React, { useState } from 'react';
import {
  usePrinterSettingsStore,
  normalizePrinterUrl,
  DEFAULT_PRINTER_URL,
} from '../model/printer-settings-store';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  Button,
  Input,
  Label,
  Alert,
  AlertTitle,
  AlertDescription,
  Badge,
} from '@/shared/ui';
import {
  Printer,
  Wifi,
  CheckCircle2,
  AlertCircle,
  Loader2,
  RotateCcw,
  ShieldAlert,
  Save,
} from 'lucide-react';
import { toast } from 'sonner';

interface PrinterSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

function PrinterSettingsForm({
  currentUrl,
  onClose,
}: {
  currentUrl: string;
  onClose: () => void;
}) {
  const setServerUrl = usePrinterSettingsStore((s) => s.setServerUrl);
  const resetToDefault = usePrinterSettingsStore((s) => s.resetToDefault);
  const testConnection = usePrinterSettingsStore((s) => s.testConnection);

  const [inputUrl, setInputUrl] = useState(currentUrl);
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<{
    ok: boolean;
    message: string;
  } | null>(null);

  const isHttpsSite =
    typeof window !== 'undefined' && window.location.protocol === 'https:';
  const isTargetHttp =
    inputUrl.trim().startsWith('http://') || !inputUrl.trim().startsWith('https://');
  const showMixedContentWarning = isHttpsSite && isTargetHttp;

  const handleTest = async () => {
    setIsTesting(true);
    setTestResult(null);
    try {
      const normalized = normalizePrinterUrl(inputUrl);
      const res = await testConnection(normalized);
      setTestResult(res);
      if (res.ok) {
        toast.success('Связь с принтером установлена!');
      } else {
        toast.error('Сервер печати недоступен');
      }
    } finally {
      setIsTesting(false);
    }
  };

  const handleSave = () => {
    const normalized = normalizePrinterUrl(inputUrl);
    setServerUrl(normalized);
    toast.success(`Адрес сервера печати сохранен: ${normalized}`);
    onClose();
  };

  const handleReset = () => {
    resetToDefault();
    setInputUrl(DEFAULT_PRINTER_URL);
    setTestResult(null);
    toast.info('Сброшено на локальный адрес по умолчанию');
  };

  return (
    <>
      <div className="p-6 space-y-4">
        {/* IP Input */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="printer-url" className="text-xs font-semibold">
              IP-адрес или URL сервиса печати:
            </Label>
            <Badge variant="outline" className="text-[10px] font-mono">
              порт по умолчанию: 9100
            </Badge>
          </div>
          <div className="flex gap-2">
            <Input
              id="printer-url"
              type="text"
              value={inputUrl}
              onChange={(e) => {
                setInputUrl(e.target.value);
                setTestResult(null);
              }}
              placeholder="например: 192.168.0.105:9100 или http://192.168.0.105:9100"
              className="font-mono text-xs h-9"
            />
          </div>
          <p className="text-[11px] text-muted-foreground">
            Укажите IP-адрес компьютера в локальной сети Wi-Fi, на котором запущена программа печати (например, <code className="font-mono bg-muted px-1 rounded">192.168.0.15:9100</code>).
          </p>
        </div>

        {/* Quick presets */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-[11px] text-muted-foreground">Быстрый выбор:</span>
          <Button
            type="button"
            variant="outline"
            size="xs"
            onClick={() => {
              setInputUrl('http://localhost:9100');
              setTestResult(null);
            }}
            className="text-[11px] h-6 px-2"
          >
            localhost:9100
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="xs"
            onClick={handleReset}
            className="text-[11px] h-6 px-2 text-muted-foreground hover:text-foreground"
          >
            <RotateCcw className="size-3 mr-1" />
            Сброс
          </Button>
        </div>

        {/* Mixed content warning */}
        {showMixedContentWarning && (
          <Alert variant="default" className="border-amber-300 dark:border-amber-700/60 bg-amber-50 dark:bg-amber-950/30 text-amber-900 dark:text-amber-200 py-2.5">
            <ShieldAlert className="size-4 text-amber-600 dark:text-amber-400" />
            <AlertTitle className="text-xs font-semibold">
              Внимание: HTTPS и локальная сеть
            </AlertTitle>
            <AlertDescription className="text-[11px] text-amber-800 dark:text-amber-300 mt-1 leading-relaxed">
              Сайт открыт по защищенному протоколу HTTPS. Браузер на телефоне может блокировать незащищенные HTTP-запросы в локальную сеть. Если печать с телефона не работает, открывайте сайт в телефоне по локальному IP (например, <code className="font-mono bg-amber-200/50 dark:bg-amber-900/50 px-1 rounded">http://192.168.X.X:3000</code>).
            </AlertDescription>
          </Alert>
        )}

        {/* Test connection result */}
        {testResult && (
          <Alert
            variant={testResult.ok ? 'default' : 'destructive'}
            className={testResult.ok ? 'border-emerald-300 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-900 dark:text-emerald-200' : ''}
          >
            {testResult.ok ? (
              <CheckCircle2 className="size-4 text-emerald-600 dark:text-emerald-400" />
            ) : (
              <AlertCircle className="size-4" />
            )}
            <AlertTitle className="text-xs font-semibold">
              {testResult.ok ? 'Соединение успешно' : 'Ошибка соединения'}
            </AlertTitle>
            <AlertDescription className="text-xs mt-0.5">
              {testResult.message}
            </AlertDescription>
          </Alert>
        )}
      </div>

      <DialogFooter className="px-6 py-3 border-t border-border bg-muted/30 flex items-center justify-between sm:justify-between">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleTest}
          disabled={isTesting || !inputUrl.trim()}
          className="gap-1.5"
        >
          {isTesting ? (
            <Loader2 className="size-3.5 animate-spin" />
          ) : (
            <Wifi className="size-3.5" />
          )}
          {isTesting ? 'Проверка...' : 'Проверить связь'}
        </Button>

        <div className="flex items-center gap-2">
          <Button type="button" variant="ghost" size="sm" onClick={onClose}>
            Отмена
          </Button>
          <Button type="button" variant="default" size="sm" onClick={handleSave} className="gap-1.5">
            <Save className="size-3.5" />
            Сохранить
          </Button>
        </div>
      </DialogFooter>
    </>
  );
}

export function PrinterSettingsModal({ isOpen, onClose }: PrinterSettingsModalProps) {
  const currentUrl = usePrinterSettingsStore((s) => s.serverUrl);

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-lg p-0 overflow-hidden gap-0">
        <DialogHeader className="px-6 py-4 border-b border-border bg-muted/30">
          <div className="flex items-center gap-3">
            <div className="size-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
              <Printer className="size-5" />
            </div>
            <div>
              <DialogTitle className="text-base font-semibold flex items-center gap-2">
                Настройки сервера печати
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground">
                Укажите IP-адрес компьютера с подключенным принтером для мобильных устройств
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {isOpen && (
          <PrinterSettingsForm
            key={currentUrl}
            currentUrl={currentUrl}
            onClose={onClose}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}
