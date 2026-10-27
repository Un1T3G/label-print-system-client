import { NextResponse } from 'next/server';
import {
  createSessionToken,
  setSessionCookie,
  DEFAULT_CONSULTANT_USER,
} from '@/shared/auth';

export async function logoutHandler() {
  const token = await createSessionToken(DEFAULT_CONSULTANT_USER);
  await setSessionCookie(token);
  return NextResponse.json({ success: true, user: DEFAULT_CONSULTANT_USER });
}

