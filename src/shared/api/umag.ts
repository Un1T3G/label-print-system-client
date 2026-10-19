export const STORE_ID = Number(process.env.UMAG_STORE_ID || 41796);
export const UMAG_SIGNIN_URL =
  process.env.UMAG_SIGNIN_URL || 'https://api.umag.kz/rest/cabinet/org/login/signin';
export const UMAG_BASIC_AUTH =
  process.env.UMAG_BASIC_AUTH || 'Basic Kzk5OCAoOTQpIDE0Ny00My00NzokMTQ3NDM0N25O';
export const UMAG_API_VER = process.env.UMAG_API_VER || '1.4';
export const UMAG_CLIENT_VER = process.env.UMAG_CLIENT_VER || 'angular_cabinet_20.1.9';
export const UMAG_REFERER = process.env.UMAG_REFERER || 'https://web.umag.uz/';
export const UMAG_API_URL = `https://api.umag.kz/rest/cabinet/nom/product/search?storeId=${STORE_ID}`;

let cachedSessionToken: string | null = null;
let tokenExpiresAt: number = 0;

export async function getUmagSessionToken(forceRefresh = false): Promise<string> {
  const now = Date.now();
  if (!forceRefresh && cachedSessionToken && now < tokenExpiresAt) {
    return cachedSessionToken;
  }

  const res = await fetch(UMAG_SIGNIN_URL, {
    method: 'GET',
    headers: {
      'authorization': UMAG_BASIC_AUTH,
      'content-type': 'application/json',
      'accept': 'application/json, text/plain, */*',
      'api-ver': UMAG_API_VER,
      'client-ver': UMAG_CLIENT_VER,
      'referer': UMAG_REFERER,
      'user-agent':
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36',
    },
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Umag signin failed (${res.status}): ${errorText}`);
  }

  const data = await res.json();
  if (!data?.sessionToken) {
    throw new Error('Umag signin response did not contain sessionToken');
  }

  const token: string = String(data.sessionToken);
  cachedSessionToken = token;
  tokenExpiresAt = now + 12 * 60 * 60 * 1000;
  return token;
}
