import { NextResponse } from 'next/server';
import { db } from '@/shared/db';
import { PRESET_USERS, createSessionToken, setSessionCookie, type SessionUser } from '@/shared/auth';
import { loginSchema } from '../model/login-schema';

export async function loginHandler(request: Request) {
  try {
    const body = await request.json();
    const parsed = loginSchema.safeParse(body);

    if (!parsed.success) {
      const errorMsg = parsed.error.issues[0]?.message || 'Некорректные учетные данные';
      return NextResponse.json(
        { error: errorMsg },
        { status: 400 }
      );
    }

    const { login, password } = parsed.data;

    let authenticatedUser: SessionUser | null = null;

    // 1. Try checking in Prisma database
    try {
      const userFromDb = await db.user.findUnique({
        where: { login: login.trim() },
      });

      if (userFromDb && userFromDb.password === password) {
        authenticatedUser = {
          id: userFromDb.id,
          login: userFromDb.login,
          name: userFromDb.name,
          role: userFromDb.role,
        };
      }
    } catch {
      // If DB is temporarily unreachable or not migrated yet, fall back to preset users
    }

    // 2. Check preset demo users if not found in DB
    if (!authenticatedUser) {
      const preset = PRESET_USERS.find(
        (u) =>
          u.login.toLowerCase() === login.trim().toLowerCase() &&
          u.passwordHash === password
      );

      if (preset) {
        authenticatedUser = {
          id: preset.id,
          login: preset.login,
          name: preset.name,
          role: preset.role,
        };
      }
    }

    if (!authenticatedUser) {
      return NextResponse.json(
        { error: 'Неверный логин или пароль' },
        { status: 401 }
      );
    }

    const token = await createSessionToken(authenticatedUser);
    await setSessionCookie(token);

    return NextResponse.json({
      success: true,
      user: authenticatedUser,
    });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Неизвестная ошибка';
    return NextResponse.json(
      { error: `Ошибка авторизации: ${msg}` },
      { status: 500 }
    );
  }
}
