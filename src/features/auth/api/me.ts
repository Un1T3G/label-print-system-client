import { NextResponse } from 'next/server';
import { getCurrentSession } from '@/shared/auth';

export async function meHandler() {
  const session = await getCurrentSession();
  if (!session) {
    return NextResponse.json(
      { authenticated: false, user: null },
      { status: 401 }
    );
  }
  return NextResponse.json({ authenticated: true, user: session });
}
