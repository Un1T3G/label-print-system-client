'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { PrinterStatus } from '../types';

export const DEFAULT_PRINTER_URL =
  process.env.NEXT_PUBLIC_LOCAL_PRINTER_URL?.replace(/\/print$/, '') || 'http://localhost:9100';

export function normalizePrinterUrl(input: string): string {
  let trimmed = input.trim();
  if (!trimmed) {
    return DEFAULT_PRINTER_URL;
  }

  // Добавляем http://, если протокол не указан
  if (!/^https?:\/\//i.test(trimmed)) {
    trimmed = `http://${trimmed}`;
  }

  try {
    const url = new URL(trimmed);
    // Если порт не указан, подставляем стандартный порт 9100
    if (!url.port) {
      url.port = '9100';
    }
    // Удаляем конечные пути вроде /print или /print-pdf и лишние слэши
    const cleanPath = url.pathname.replace(/\/print(-pdf)?\/?$/i, '').replace(/\/+$/, '');
    return `${url.protocol}//${url.hostname}${url.port ? `:${url.port}` : ''}${cleanPath}`;
  } catch {
    return trimmed.replace(/\/print(-pdf)?\/?$/i, '').replace(/\/+$/, '');
  }
}

interface PrinterSettingsState {
  serverUrl: string;
  isLoadingServerUrl: boolean;
  fetchServerUrl: () => Promise<string>;
  setServerUrl: (url: string) => Promise<void>;
  resetToDefault: () => Promise<void>;
  testConnection: (customUrl?: string) => Promise<{
    ok: boolean;
    message: string;
    data?: PrinterStatus;
  }>;
}

export const usePrinterSettingsStore = create<PrinterSettingsState>()(
  persist(
    (set, get) => ({
      serverUrl: DEFAULT_PRINTER_URL,
      isLoadingServerUrl: false,

      // Загрузить сохраненный на сервере URL
      fetchServerUrl: async () => {
        try {
          set({ isLoadingServerUrl: true });
          const res = await fetch('/api/printer');
          if (res.ok) {
            const data = await res.json();
            if (data.printerUrl) {
              const normalized = normalizePrinterUrl(data.printerUrl);
              set({ serverUrl: normalized });
              return normalized;
            }
          }
        } catch {
          // Игнорируем сетевые ошибки, остаемся на текущем
        } finally {
          set({ isLoadingServerUrl: false });
        }
        return get().serverUrl;
      },

      // Сохранить новый URL в браузере и на сервере
      setServerUrl: async (url: string) => {
        const normalized = normalizePrinterUrl(url);
        set({ serverUrl: normalized });

        // Сохраняем на сервере
        try {
          await fetch('/api/printer', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ printerUrl: normalized }),
          });
        } catch {
          // Если сервер недоступен, локально уже сохранено
        }
      },

      // Сбросить по умолчанию на клиенте и на сервере
      resetToDefault: async () => {
        set({ serverUrl: DEFAULT_PRINTER_URL });
        try {
          await fetch('/api/printer', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ printerUrl: DEFAULT_PRINTER_URL }),
          });
        } catch {
          // fallback
        }
      },

      testConnection: async (customUrl?: string) => {
        const targetUrl = customUrl ? normalizePrinterUrl(customUrl) : get().serverUrl;
        
        try {
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 4000);

          const res = await fetch(`${targetUrl}/status`, {
            signal: controller.signal,
          });
          clearTimeout(timeoutId);

          if (!res.ok) {
            return {
              ok: false,
              message: `Сервер ответил ошибкой (HTTP ${res.status})`,
            };
          }

          const data = (await res.json()) as PrinterStatus;
          return {
            ok: true,
            message: `Подключение успешно! Активный принтер: ${data.activePrinter || 'По умолчанию'} (${data.version || 'v1.0'})`,
            data,
          };
        } catch (err: unknown) {
          const isAbort = err instanceof Error && err.name === 'AbortError';
          return {
            ok: false,
            message: isAbort
              ? `Таймаут соединения: сервер ${targetUrl} не отвечает за 4 сек.`
              : `Не удалось связаться с сервисом печати (${targetUrl}). Проверьте IP, порт и подключение к одной Wi-Fi сети.`,
          };
        }
      },
    }),
    {
      name: 'printer_server_settings_v1',
      onRehydrateStorage: () => (state) => {
        // При гидратации стора в браузере сразу синхронизируем актуальный IP с сервера
        if (state) {
          state.fetchServerUrl();
        }
      },
    }
  )
);

/**
 * Получить текущий базовый URL сервиса печати.
 * Безопасно для вызова как в браузере, так и на сервере.
 */
export function getPrinterBaseUrl(): string {
  if (typeof window === 'undefined') {
    return DEFAULT_PRINTER_URL;
  }

  try {
    const state = usePrinterSettingsStore.getState();
    if (state.serverUrl) {
      return state.serverUrl;
    }
  } catch {
    // В случае ошибок доступа к хранилищу
  }

  return DEFAULT_PRINTER_URL;
}
