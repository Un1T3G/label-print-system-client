import { NextResponse } from 'next/server';
import { removeSessionCookie } from '@/shared/auth';

export async function logoutHandler() {
  await removeSessionCookie();
  return NextResponse.json({ success: true });
}
