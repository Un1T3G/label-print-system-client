'use client';

import React, { useState, useEffect } from 'react';
import { fetchTsplPreview, fetchPrinterStatus, LOCAL_PRINTER_BASE } from '@/lib/printer';
import { Button } from '@/components/ui/button';
import { Terminal, Copy, Check, ExternalLink, Download, RefreshCw, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

interface TsplPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function TsplPreviewModal({ isOpen, onClose }: TsplPreviewModalProps) {
  const [tsplCode, setTsplCode] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [serviceStatus, setServiceStatus] = useState<{
    status: string;
    version: string;
    activePrinter: string;
    hasLastJob: boolean;
  } | null>(null);

  const loadData = async () => {
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
        const msg = tspl.reason instanceof Error ? tspl.reason.message : 'Не удалось получить TSPL';
        setError(msg);
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Ошибка подключения');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadData();
    }
  }, [isOpen]);

  const handleCopy = () => {
    if (!tsplCode) return;
    navigator.clipboard.writeText(tsplCode);
    setCopied(true);
    toast.success('TSPL код скопирован в буфер обмена');
    setTimeout(() => setCopied(false), 2000);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-slate-900 text-slate-100 rounded-2xl shadow-2xl border border-slate-700 max-w-2xl w-full overflow-hidden animate-in fade-in zoom-in-95 duration-150 flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="p-4 bg-slate-800/80 border-b border-slate-700/80 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-blue-500/20 text-blue-400 border border-blue-500/30">
              <Terminal className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                TSPL Команды принтера
                <span className="text-[10px] font-mono bg-blue-900/60 text-blue-300 border border-blue-500/30 px-1.5 py-0.5 rounded">
                  {LOCAL_PRINTER_BASE}/preview-tspl
                </span>
              </h3>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Прямой вывод команд термопринтера последнего печатного задания
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={loadData}
              disabled={isLoading}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-700 transition"
              title="Обновить данные"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            </button>
            <button
              type="button"
              onClick={onClose}
              className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-700 transition"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Status Bar */}
        {serviceStatus && (
          <div className="px-4 py-2 bg-slate-800/40 border-b border-slate-800 flex items-center justify-between text-[11px] text-slate-300">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>
                Принтер: <strong className="text-white">{serviceStatus.activePrinter}</strong>
              </span>
            </div>
            <div className="flex items-center gap-3">
              <a
                href={`${LOCAL_PRINTER_BASE}/preview-tspl`}
                target="_blank"
                rel="noreferrer"
                className="text-blue-400 hover:underline flex items-center gap-1"
              >
                Открыть эндпоинт <ExternalLink className="w-3 h-3" />
              </a>
              <a
                href={`${LOCAL_PRINTER_BASE}/download-prn`}
                target="_blank"
                rel="noreferrer"
                className="text-amber-400 hover:underline flex items-center gap-1"
              >
                Скачать .PRN <Download className="w-3 h-3" />
              </a>
            </div>
          </div>
        )}

        {/* Code Content */}
        <div className="p-4 flex-1 overflow-y-auto font-mono text-xs leading-relaxed bg-black/40">
          {isLoading ? (
            <div className="py-16 text-center text-slate-400 flex flex-col items-center gap-2">
              <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
              <span>Загрузка команд TSPL с сервиса печати...</span>
            </div>
          ) : error ? (
            <div className="p-4 rounded-xl bg-amber-950/40 border border-amber-800/50 text-amber-200 text-xs flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <strong className="block font-bold">Сервис печати вернул статус:</strong>
                <p className="mt-1 text-slate-300">{error}</p>
                <p className="mt-2 text-[11px] text-slate-400">
                  Отправьте хотя бы одно задание на печать кнопкой «Распечатать ценники», чтобы сервис сформировал TSPL команды.
                </p>
              </div>
            </div>
          ) : tsplCode ? (
            <div className="space-y-0.5">
              {tsplCode.split('\n').map((line, i) => {
                const trimmed = line.trim();
                let colorClass = 'text-slate-300';
                if (trimmed.startsWith('SIZE') || trimmed.startsWith('GAP') || trimmed.startsWith('SPEED') || trimmed.startsWith('DENSITY')) {
                  colorClass = 'text-amber-400 font-bold';
                } else if (trimmed.startsWith('TEXT')) {
                  colorClass = 'text-emerald-400';
                } else if (trimmed.startsWith('BARCODE') || trimmed.startsWith('QRCODE')) {
                  colorClass = 'text-purple-400 font-bold';
                } else if (trimmed.startsWith('PRINT') || trimmed.startsWith('CLS')) {
                  colorClass = 'text-blue-400 font-bold';
                }

                return (
                  <div key={i} className="flex hover:bg-white/5 py-0.5 px-1 rounded">
                    <span className="w-8 select-none text-slate-600 text-right pr-3 font-mono text-[10px]">
                      {i + 1}
                    </span>
                    <span className={colorClass}>{line}</span>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="py-12 text-center text-slate-500">
              Нет данных для отображения
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-3 bg-slate-800/80 border-t border-slate-700/80 flex items-center justify-between">
          <span className="text-[11px] text-slate-400">
            {tsplCode ? `${tsplCode.split('\n').length} строк TSPL` : ''}
          </span>

          <div className="flex items-center gap-2">
            {tsplCode && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleCopy}
                className="h-8 text-xs bg-slate-800 border-slate-700 hover:bg-slate-700 text-white gap-1.5"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                {copied ? 'Скопировано!' : 'Копировать TSPL'}
              </Button>
            )}
            <Button
              type="button"
              size="sm"
              onClick={onClose}
              className="h-8 text-xs bg-blue-600 hover:bg-blue-700 text-white"
            >
              Закрыть
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
