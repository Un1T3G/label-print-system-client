import type { PrintJobPayload } from './types';

export const LOCAL_PRINTER_BASE =
  process.env.NEXT_PUBLIC_LOCAL_PRINTER_URL?.replace(/\/print$/, '') || 'http://localhost:9100';

export async function sendToLocalPrinter(payload: PrintJobPayload) {
  try {
    const res = await fetch(`${LOCAL_PRINTER_BASE}/print`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      throw new Error(`Ошибка локального сервиса печати: статус ${res.status}`);
    }
    return await res.json();
  } catch (err: unknown) {
    if (err instanceof Error && err.message.includes('локального сервиса')) {
      throw err;
    }
    throw new Error(
      'Не удалось связаться с печатным сервисом (http://localhost:9100/print). Проверьте, запущена ли программа печати на компьютере.'
    );
  }
}

export async function sendPdfToLocalPrinter(payload: {
  pdfBase64: string;
  printer?: string;
  filename?: string;
}) {
  try {
    const res = await fetch(`${LOCAL_PRINTER_BASE}/print-pdf`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(errorData.error || `Ошибка сервиса печати: статус ${res.status}`);
    }
    return await res.json();
  } catch (err: unknown) {
    if (err instanceof Error && err.message.includes('сервиса печати')) {
      throw err;
    }
    throw new Error(
      'Не удалось отправить PDF в сервис печати (http://localhost:9100/print-pdf). Проверьте, что сервис запущен.'
    );
  }
}

export async function fetchTsplPreview(): Promise<string> {
  const res = await fetch(`${LOCAL_PRINTER_BASE}/preview-tspl`);
  if (!res.ok) {
    if (res.status === 404) {
      throw new Error('Печатных заданий пока не было в сервисе печати.');
    }
    throw new Error(`Ошибка получения TSPL: статус ${res.status}`);
  }
  return await res.text();
}

export async function fetchPrinterStatus(): Promise<{
  status: string;
  version: string;
  activePrinter: string;
  hasLastJob: boolean;
}> {
  const res = await fetch(`${LOCAL_PRINTER_BASE}/status`);
  if (!res.ok) {
    throw new Error(`Ошибка статуса: ${res.status}`);
  }
  return await res.json();
}
