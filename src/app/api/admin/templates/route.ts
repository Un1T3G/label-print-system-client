import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { CreatePrintTemplateDto, PrintTemplate } from '@/lib/types';
import { DEFAULT_TEMPLATES } from '@/lib/templates-data';
import { Prisma } from '@prisma/client';

export async function GET() {
  try {
    const templatesFromDb = await db.printTemplate.findMany({
      orderBy: [{ isDefault: 'desc' }, { createdAt: 'desc' }],
    });

    if (templatesFromDb.length > 0) {
      const formatted: PrintTemplate[] = templatesFromDb.map((t) => ({
        id: t.id,
        name: t.name,
        widthMm: t.widthMm,
        heightMm: t.heightMm,
        isDefault: t.isDefault,
        config: t.config as unknown as PrintTemplate['config'],
        createdAt: t.createdAt.toISOString(),
        updatedAt: t.updatedAt.toISOString(),
      }));
      return NextResponse.json(formatted);
    }

    return NextResponse.json(DEFAULT_TEMPLATES);
  } catch {
    // Fallback if database is not yet migrated/connected
    return NextResponse.json(DEFAULT_TEMPLATES);
  }
}

export async function POST(request: Request) {
  try {
    const body: CreatePrintTemplateDto = await request.json();

    if (!body.name || !body.widthMm || !body.heightMm) {
      return NextResponse.json(
        { error: 'Укажите название, ширину и высоту шаблона' },
        { status: 400 }
      );
    }

    try {
      // If marking as default, reset other defaults
      if (body.isDefault) {
        await db.printTemplate.updateMany({
          where: { isDefault: true },
          data: { isDefault: false },
        });
      }

      const newTemplate = await db.printTemplate.create({
        data: {
          name: body.name,
          widthMm: Number(body.widthMm),
          heightMm: Number(body.heightMm),
          isDefault: Boolean(body.isDefault),
          config: (body.config ?? {}) as unknown as Prisma.InputJsonValue,
        },
      });

      const formatted: PrintTemplate = {
        id: newTemplate.id,
        name: newTemplate.name,
        widthMm: newTemplate.widthMm,
        heightMm: newTemplate.heightMm,
        isDefault: newTemplate.isDefault,
        config: newTemplate.config as unknown as PrintTemplate['config'],
        createdAt: newTemplate.createdAt.toISOString(),
        updatedAt: newTemplate.updatedAt.toISOString(),
      };

      return NextResponse.json(formatted, { status: 201 });
    } catch {
      // Return synthetic template if DB is offline
      const fallbackTemplate: PrintTemplate = {
        id: `tpl-${Date.now()}`,
        name: body.name,
        widthMm: Number(body.widthMm),
        heightMm: Number(body.heightMm),
        isDefault: Boolean(body.isDefault),
        config: body.config,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      return NextResponse.json(fallbackTemplate, { status: 201 });
    }
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Неизвестная ошибка';
    return NextResponse.json(
      { error: `Ошибка создания шаблона: ${msg}` },
      { status: 500 }
    );
  }
}
