import { NextResponse } from 'next/server';
import {
  UMAG_API_URL,
  getUmagSessionToken,
  UMAG_API_VER,
  UMAG_CLIENT_VER,
  UMAG_REFERER,
} from '@/shared/api';
import type {
  UmagProductSearchPayload,
  UmagProduct,
  UmagSearchResponse,
} from '../types';

export async function productSearchHandler(request: Request) {
  try {
    const body: UmagProductSearchPayload = await request.json();

    const requestBody = JSON.stringify({
      first: typeof body.first === 'number' ? body.first : 0,
      pageSize: typeof body.pageSize === 'number' ? body.pageSize : 20,
      measure: body.measure !== undefined ? body.measure : undefined,
      fullSearchCriteria: body.fullSearchCriteria?.trim() || undefined,
    });

    const commonHeaders = {
      'content-type': 'application/json',
      'accept': 'application/json, text/plain, */*',
      'api-ver': UMAG_API_VER,
      'client-ver': UMAG_CLIENT_VER,
      'referer': UMAG_REFERER,
      'user-agent':
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36',
    };

    const doSearch = async (token: string) => {
      return await fetch(UMAG_API_URL, {
        method: 'POST',
        headers: {
          ...commonHeaders,
          authorization: token,
        },
        body: requestBody,
      });
    };

    // 1. Fetch products with active or cached session token
    let token = await getUmagSessionToken();
    let response = await doSearch(token);

    // 2. If token expired or unauthorized (401 / 403), force refresh and retry once
    if (response.status === 401 || response.status === 403) {
      token = await getUmagSessionToken(true);
      response = await doSearch(token);
    }

    if (!response.ok) {
      const errorText = await response.text();
      return NextResponse.json(
        { error: `Ошибка сервера Umag API (${response.status}): ${errorText}` },
        { status: response.status }
      );
    }

    const data: UmagSearchResponse = await response.json();

    // Normalize products: ensure wholesalePrice represents the actual retail selling price
    const normalizedContent: UmagProduct[] = (data.content || []).map((product) => {
      const effectiveWholesalePrice =
        product.wholesalePrice && product.wholesalePrice > 0
          ? product.wholesalePrice
          : product.sellingPrice || 0;

      return {
        ...product,
        wholesalePrice: effectiveWholesalePrice,
        measureName: product.measureName || (product.type === 1 ? 'кг.' : 'шт.'),
      };
    });

    return NextResponse.json({
      ...data,
      content: normalizedContent,
    });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Неизвестная ошибка';
    return NextResponse.json(
      { error: `Внутренняя ошибка сервера: ${msg}` },
      { status: 500 }
    );
  }
}
