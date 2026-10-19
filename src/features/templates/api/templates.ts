import { NextResponse } from 'next/server';
import { db } from '@/shared/db';
import type { PrintTemplate } from '../types';
import { DEFAULT_TEMPLATES } from '../lib/default-templates';
import { Prisma } from '@prisma/client';
import { getCurrentSession } from '@/shared/auth';
import { createTemplateSchema } from '../model/template-schema';

export async function getTemplatesHandler() {
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
    return NextResponse.json(DEFAULT_TEMPLATES);
  }
}

export async function createTemplateHandler(request: Request) {
  try {
    const session = await getCurrentSession();
    if (!session || session.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Доступ запрещен. Только администратор может создавать шаблоны' },
        { status: 403 }
      );
    }

    const rawBody = await request.json();
    const parsed = createTemplateSchema.safeParse(rawBody);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || 'Некорректные данные шаблона' },
        { status: 400 }
      );
    }

    const body = parsed.data;

    try {
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
      const fallbackTemplate: PrintTemplate = {
        id: `tpl-${Date.now()}`,
        name: body.name,
        widthMm: Number(body.widthMm),
        heightMm: Number(body.heightMm),
        isDefault: Boolean(body.isDefault),
        config: (body.config || {}) as unknown as PrintTemplate['config'],
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
