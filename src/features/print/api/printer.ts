import type { PrintJobPayload, PrinterStatus } from '../types';
import { getPrinterBaseUrl, DEFAULT_PRINTER_URL } from '../model/printer-settings-store';

export { getPrinterBaseUrl, DEFAULT_PRINTER_URL };
export const LOCAL_PRINTER_BASE = DEFAULT_PRINTER_URL;

export async function sendToLocalPrinter(payload: PrintJobPayload) {
  const baseUrl = getPrinterBaseUrl();
  try {
    const res = await fetch(`${baseUrl}/print`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      throw new Error(`Ошибка сервиса печати (${baseUrl}): статус ${res.status}`);
    }
    return await res.json();
  } catch (err: unknown) {
    if (err instanceof Error && err.message.includes('Ошибка сервиса печати')) {
      throw err;
    }
    throw new Error(
      `Не удалось связаться с сервисом печати (${baseUrl}/print). Проверьте IP-адрес в настройках и убедитесь, что сервис запущен на компьютере.`
    );
  }
}

export async function sendPdfToLocalPrinter(payload: {
  pdfBase64: string;
  printer?: string;
  filename?: string;
}) {
  const baseUrl = getPrinterBaseUrl();

  // 1. Попытка отправить напрямую на настроенный IP
  try {
    const res = await fetch(`${baseUrl}/print-pdf`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (res.ok) {
      return await res.json();
    }
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || `Ошибка сервиса печати: статус ${res.status}`);
  } catch (directErr: unknown) {
    // 2. Фоллбек: попытка отправить через серверный прокси /api/printer/print-pdf
    try {
      const proxyRes = await fetch('/api/printer/print-pdf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (proxyRes.ok) {
        return await proxyRes.json();
      }
    } catch {
      // Игнорируем ошибку прокси и возвращаем основную
    }

    if (directErr instanceof Error && directErr.message.includes('Ошибка сервиса печати')) {
      throw directErr;
    }
    throw new Error(
      `Не удалось отправить PDF в сервис печати (${baseUrl}/print-pdf). Проверьте IP-адрес в настройках и статус сервиса.`
    );
  }
}

export async function fetchTsplPreview(): Promise<string> {
  const baseUrl = getPrinterBaseUrl();
  const res = await fetch(`${baseUrl}/preview-tspl`);
  if (!res.ok) {
    if (res.status === 404) {
      throw new Error('Печатных заданий пока не было в сервисе печати.');
    }
    throw new Error(`Ошибка получения TSPL (${baseUrl}): статус ${res.status}`);
  }
  return await res.text();
}

export async function fetchPrinterStatus(): Promise<PrinterStatus> {
  const baseUrl = getPrinterBaseUrl();
  const res = await fetch(`${baseUrl}/status`);
  if (!res.ok) {
    throw new Error(`Ошибка статуса (${baseUrl}): ${res.status}`);
  }
  return await res.json();
}
