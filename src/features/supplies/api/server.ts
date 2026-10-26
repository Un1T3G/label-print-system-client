import { NextResponse } from 'next/server';
import { getCurrentSession } from '@/shared/auth';
import {
  STORE_ID,
  getUmagSessionToken,
  UMAG_API_VER,
  UMAG_CLIENT_VER,
  UMAG_REFERER,
} from '@/shared/api';
import type { UmagSuppliesListResponse, UmagSupplyDetails } from '../types';

const COMMON_HEADERS = {
  'content-type': 'application/json',
  'accept': 'application/json, text/plain, */*',
  'api-ver': UMAG_API_VER,
  'client-ver': UMAG_CLIENT_VER,
  'referer': UMAG_REFERER,
  'user-agent':
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36',
};

/**
 * GET /api/admin/supplies
 * Lists supplies with pagination and date filter
 */
export async function getSuppliesListHandler(request: Request) {
  try {
    const session = await getCurrentSession();
    if (!session || session.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Доступ запрещен. Только администратор имеет доступ к приемкам' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const first = searchParams.get('first') || '0';
    const pageSize = searchParams.get('pageSize') || '50';

    // Default to last 7 days if not provided
    const now = Date.now();
    const defaultFromTime = now - 7 * 24 * 60 * 60 * 1000;
    const fromTime = searchParams.get('fromTime') || String(defaultFromTime);
    const toTime = searchParams.get('toTime') || String(now);

    const targetUrl = `https://api.umag.kz/rest/cabinet/opr/supplies/all?first=${first}&pageSize=${pageSize}&fromTime=${fromTime}&toTime=${toTime}&storeId=${STORE_ID}`;

    const doFetch = async (token: string) => {
      return await fetch(targetUrl, {
        method: 'GET',
        headers: {
          ...COMMON_HEADERS,
          authorization: token,
        },
      });
    };

    let token = await getUmagSessionToken();
    let response = await doFetch(token);

    if (response.status === 401 || response.status === 403) {
      token = await getUmagSessionToken(true);
      response = await doFetch(token);
    }

    if (!response.ok) {
      const errText = await response.text();
      return NextResponse.json(
        { error: `Ошибка Umag API (${response.status}): ${errText}` },
        { status: response.status }
      );
    }

    const data: UmagSuppliesListResponse = await response.json();
    return NextResponse.json(data);
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Неизвестная ошибка';
    return NextResponse.json(
      { error: `Внутренняя ошибка сервера: ${msg}` },
      { status: 500 }
    );
  }
}

/**
 * GET /api/admin/supplies/[id]
 * Retrieves single supply details including supplyProducts
 */
export async function getSupplyDetailsHandler(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getCurrentSession();
    if (!session || session.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Доступ запрещен. Только администратор имеет доступ к приемкам' },
        { status: 403 }
      );
    }

    const { id } = await params;
    if (!id) {
      return NextResponse.json(
        { error: 'ID приемки не указан' },
        { status: 400 }
      );
    }

    const targetUrl = `https://api.umag.kz/rest/cabinet/opr/supplies/${id}?storeId=${STORE_ID}`;

    const doFetch = async (token: string) => {
      return await fetch(targetUrl, {
        method: 'GET',
        headers: {
          ...COMMON_HEADERS,
          authorization: token,
        },
      });
    };

    let token = await getUmagSessionToken();
    let response = await doFetch(token);

    if (response.status === 401 || response.status === 403) {
      token = await getUmagSessionToken(true);
      response = await doFetch(token);
    }

    if (!response.ok) {
      const errText = await response.text();
      return NextResponse.json(
        { error: `Ошибка Umag API (${response.status}): ${errText}` },
        { status: response.status }
      );
    }

    const data: UmagSupplyDetails = await response.json();
    return NextResponse.json(data);
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Неизвестная ошибка';
    return NextResponse.json(
      { error: `Внутренняя ошибка сервера: ${msg}` },
      { status: 500 }
    );
  }
}
