import { NextResponse } from 'next/server';
import { readServerPrinterUrl } from '@/shared/lib/printer-config';

export async function POST(request: Request) {
  try {
    const printerBase = await readServerPrinterUrl();
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
