import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

const CONFIG_FILE_PATH = path.join(process.cwd(), '.printer-config.json');

const DEFAULT_URL =
  process.env.NEXT_PUBLIC_LOCAL_PRINTER_URL?.replace(/\/print$/, '') || 'http://localhost:9100';

async function getPrinterUrl(): Promise<string> {
  try {
    const data = await fs.readFile(CONFIG_FILE_PATH, 'utf-8');
    const parsed = JSON.parse(data);
    if (parsed.printerUrl && typeof parsed.printerUrl === 'string') {
      return parsed.printerUrl;
    }
  } catch {
    // fallback
  }
  return DEFAULT_URL;
}

export async function POST(request: Request) {
  try {
    const printerBase = await getPrinterUrl();
    const payload = await request.json();

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 7000);

    const res = await fetch(`${printerBase}/print-pdf`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });
    clearTimeout(timeout);

    if (!res.ok) {
      const errorText = await res.text().catch(() => '');
      return NextResponse.json(
        { error: `Сервер печати (${printerBase}) ответил со статусом ${res.status}: ${errorText}` },
        { status: res.status }
      );
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch (err: unknown) {
    const msg =
      err instanceof Error
        ? err.message
        : 'Ошибка соединения с сервисом печати';
    return NextResponse.json(
      { error: `Не удалось связаться с сервисом печати: ${msg}` },
      { status: 502 }
    );
  }
}
