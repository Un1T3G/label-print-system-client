import { NextResponse } from 'next/server';
import {
  getCurrentSession,
  createSessionToken,
  setSessionCookie,
  DEFAULT_CONSULTANT_USER,
} from '@/shared/auth';

export async function meHandler() {
  let session = await getCurrentSession();
  if (!session) {
    const token = await createSessionToken(DEFAULT_CONSULTANT_USER);
    await setSessionCookie(token);
    session = DEFAULT_CONSULTANT_USER;
  }
  return NextResponse.json({ authenticated: true, user: session });
}

