import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

const CONFIG_FILE_PATH = path.join(process.cwd(), '.printer-config.json');

const DEFAULT_URL =
  process.env.NEXT_PUBLIC_LOCAL_PRINTER_URL?.replace(/\/print$/, '') || 'http://localhost:9100';

function normalizeUrl(input: string): string {
  let trimmed = input.trim();
  if (!trimmed) {
    return DEFAULT_URL;
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

async function readServerPrinterUrl(): Promise<string> {
  try {
    const data = await fs.readFile(CONFIG_FILE_PATH, 'utf-8');
    const parsed = JSON.parse(data);
    if (parsed.printerUrl && typeof parsed.printerUrl === 'string') {
      return normalizeUrl(parsed.printerUrl);
    }
  } catch {
    // Файл не существует или поврежден — используем дефолт
  }
  return DEFAULT_URL;
}

async function writeServerPrinterUrl(url: string): Promise<string> {
  const normalized = normalizeUrl(url);
  const data = JSON.stringify(
    {
      printerUrl: normalized,
      updatedAt: new Date().toISOString(),
    },
    null,
    2
  );
  await fs.writeFile(CONFIG_FILE_PATH, data, 'utf-8');
  return normalized;
}

// GET /api/printer - Получить текущий IP/URL сервиса печати, сохраненный на сервере
export async function GET() {
  try {
    const printerUrl = await readServerPrinterUrl();
    return NextResponse.json({ printerUrl });
  } catch {
    return NextResponse.json({ printerUrl: DEFAULT_URL });
  }
}

// POST /api/printer - Сохранить новый IP/URL сервиса печати на сервере
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
      message: `IP-адрес сервера печати успешно сохранен на сервере: ${savedUrl}`,
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Ошибка сохранения на сервере';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
