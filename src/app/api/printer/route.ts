import { NextResponse } from 'next/server';
import {
  readServerPrinterUrl,
  writeServerPrinterUrl,
  DEFAULT_PRINTER_URL,
} from '@/shared/lib/printer-config';

// GET /api/printer - Получить текущий IP/URL сервиса печати (из БД с фоллбеком)
export async function GET() {
  try {
    const printerUrl = await readServerPrinterUrl();
    return NextResponse.json({ printerUrl });
  } catch {
    return NextResponse.json({ printerUrl: DEFAULT_PRINTER_URL });
  }
}

// POST /api/printer - Сохранить новый IP/URL сервиса печати в БД
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const rawUrl = body.printerUrl || body.url;

    if (!rawUrl || typeof rawUrl !== 'string') {
      return NextResponse.json(
        { error: 'Не передан параметр printerUrl' },
        { status: 400 }
      );
    }

    const savedUrl = await writeServerPrinterUrl(rawUrl);

    return NextResponse.json({
      success: true,
      printerUrl: savedUrl,
      message: `IP-адрес сервера печати успешно сохранен в базе данных: ${savedUrl}`,
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Ошибка сохранения в базе данных';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
