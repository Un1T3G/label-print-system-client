import fs from 'fs/promises';
import path from 'path';
import { db } from '@/shared/db';

const CONFIG_FILE_PATH = path.join(process.cwd(), '.printer-config.json');
export const PRINTER_URL_SETTING_KEY = 'printer_url';

export const DEFAULT_PRINTER_URL =
  process.env.NEXT_PUBLIC_LOCAL_PRINTER_URL?.replace(/\/print$/, '') || 'http://localhost:9100';

export function normalizePrinterUrl(input: string): string {
  let trimmed = input.trim();
  if (!trimmed) {
    return DEFAULT_PRINTER_URL;
  }

  if (!/^https?:\/\//i.test(trimmed)) {
    trimmed = `http://${trimmed}`;
  }

  try {
    const url = new URL(trimmed);
    if (!url.port) {
      url.port = '9100';
    }
    const cleanPath = url.pathname.replace(/\/print(-pdf)?\/?$/i, '').replace(/\/+$/, '');
    return `${url.protocol}//${url.hostname}${url.port ? `:${url.port}` : ''}${cleanPath}`;
  } catch {
    return trimmed.replace(/\/print(-pdf)?\/?$/i, '').replace(/\/+$/, '');
  }
}

export async function readServerPrinterUrl(): Promise<string> {
  // 1. Попытка прочитать из БД (PostgreSQL)
  try {
    const record = await db.systemSetting.findUnique({
      where: { key: PRINTER_URL_SETTING_KEY },
    });
    if (record?.value) {
      return normalizePrinterUrl(record.value);
    }
  } catch (dbErr) {
    console.warn('[Printer URL] Не удалось прочитать из БД, пробуем локальный файл:', dbErr);
  }

  // 2. Фоллбек: чтение из локального .printer-config.json
  let fileUrl: string | null = null;
  try {
    const data = await fs.readFile(CONFIG_FILE_PATH, 'utf-8');
    const parsed = JSON.parse(data);
    if (parsed.printerUrl && typeof parsed.printerUrl === 'string') {
      fileUrl = normalizePrinterUrl(parsed.printerUrl);
    }
  } catch {
    // ignore
  }

  if (fileUrl) {
    // Автомиграция значения из файла в БД при первом чтении
    try {
      await db.systemSetting.upsert({
        where: { key: PRINTER_URL_SETTING_KEY },
        update: { value: fileUrl },
        create: {
          key: PRINTER_URL_SETTING_KEY,
          value: fileUrl,
        },
      });
    } catch {
      // ignore
    }
    return fileUrl;
  }

  return DEFAULT_PRINTER_URL;
}

export async function writeServerPrinterUrl(url: string): Promise<string> {
  const normalized = normalizePrinterUrl(url);

  // 1. Сохранение в БД (PostgreSQL)
  try {
    await db.systemSetting.upsert({
      where: { key: PRINTER_URL_SETTING_KEY },
      update: { value: normalized },
      create: {
        key: PRINTER_URL_SETTING_KEY,
        value: normalized,
      },
    });
  } catch (dbErr) {
    console.error('[Printer URL] Ошибка сохранения в БД:', dbErr);
    throw new Error(`Ошибка сохранения в БД: ${dbErr instanceof Error ? dbErr.message : 'неизвестно'}`);
  }

  // 2. Дублирование в локальный файл для офлайн-резерва
  try {
    const data = JSON.stringify(
      {
        printerUrl: normalized,
        updatedAt: new Date().toISOString(),
      },
      null,
      2
    );
    await fs.writeFile(CONFIG_FILE_PATH, data, 'utf-8');
  } catch {
    // ignore
  }

  return normalized;
}

