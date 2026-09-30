import { NextResponse } from 'next/server';
import { UmagProductSearchPayload, UMAG_API_URL } from '@/lib/umag';
import { UmagProduct, UmagSearchResponse } from '@/lib/types';

export async function POST(request: Request) {
  try {
    const body: UmagProductSearchPayload = await request.json();

    const authHeader =
      process.env.UMAG_AUTHORIZATION || 'u75049.2017af3e-deb8-4f6e-8e2b-71839011b921';
    const apiVer = process.env.UMAG_API_VER || '1.4';
    const clientVer = process.env.UMAG_CLIENT_VER || 'angular_cabinet_20.1.9';
    const referer = process.env.UMAG_REFERER || 'https://web.umag.uz/';

    const response = await fetch(UMAG_API_URL, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'accept': 'application/json, text/plain, */*',
        'authorization': authHeader,
        'api-ver': apiVer,
        'client-ver': clientVer,
        'referer': referer,
        'user-agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36',
      },
      body: JSON.stringify({
        first: typeof body.first === 'number' ? body.first : 0,
        pageSize: typeof body.pageSize === 'number' ? body.pageSize : 20,
        measure: body.measure !== undefined ? body.measure : undefined,
        fullSearchCriteria: body.fullSearchCriteria?.trim() || undefined,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      return NextResponse.json(
        { error: `Ошибка сервера Umag API (${response.status}): ${errorText}` },
        { status: response.status }
      );
    }

    const data: UmagSearchResponse = await response.json();

    // Normalize products: ensure wholesalePrice represents the actual retail selling price
    // (in Umag, if wholesalePrice is 0, the selling price is stored in sellingPrice)
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
