import { cookies } from 'next/headers';
import { SignJWT, jwtVerify } from 'jose';
import { SessionUser, UserRole } from './types';

export const SESSION_COOKIE_NAME = 'label_auth_session';

const JWT_SECRET_STRING = process.env.JWT_SECRET || 'default-label-system-secret-key-at-least-32-chars-long';
const SECRET_KEY = new TextEncoder().encode(JWT_SECRET_STRING);

export const PRESET_USERS: Array<SessionUser & { passwordHash: string }> = [
  {
    id: 'user-admin-1',
    login: 'admin',
    name: 'Администратор системы',
    role: 'ADMIN',
    passwordHash: 'admin123',
  },
  {
    id: 'user-consultant-1',
    login: 'consultant',
    name: 'Продавец-консультант',
    role: 'CONSULTANT',
    passwordHash: 'consultant123',
  },
];

export async function createSessionToken(user: SessionUser): Promise<string> {
  return await new SignJWT({
    id: user.id,
    login: user.login,
    name: user.name,
    role: user.role,
  })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(SECRET_KEY);
}

export async function verifySessionToken(token: string): Promise<SessionUser | null> {
  try {
    const { payload } = await jwtVerify(token, SECRET_KEY);
    return {
      id: payload.id as string,
      login: payload.login as string,
      name: payload.name as string,
      role: payload.role as UserRole,
    };
  } catch {
    return null;
  }
}

export async function getCurrentSession(): Promise<SessionUser | null> {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get(SESSION_COOKIE_NAME);
  if (!sessionCookie?.value) {
    return null;
  }
  return await verifySessionToken(sessionCookie.value);
}

export async function setSessionCookie(token: string) {
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 7, // 7 days
  });
}

export async function removeSessionCookie() {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE_NAME);
}
