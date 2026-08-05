// Thin authenticated-fetch helper for the React tree. Reads the same
// localStorage key `frontend/public/app.js`'s `getAuthToken()` writes to, so
// both the legacy vanilla-JS wizard and the React components share one
// source of truth for the session token during the transition period.
const AUTH_TOKEN_STORAGE_KEY = 'postdrop_access_token';

export function getAuthToken(): string {
  if (typeof window === 'undefined') return '';
  try {
    return window.localStorage.getItem(AUTH_TOKEN_STORAGE_KEY) || '';
  } catch {
    return '';
  }
}

export async function apiFetch(
  url: string,
  options: RequestInit = {},
): Promise<Response> {
  const token = getAuthToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> | undefined),
  };
  if (token) headers.Authorization = `Bearer ${token}`;

  return fetch(url, { ...options, headers, credentials: 'include' });
}

export async function readErrorMessage(
  response: Response,
  fallback: string,
): Promise<string> {
  try {
    const body = await response.json();
    return typeof body?.message === 'string' ? body.message : fallback;
  } catch {
    return fallback;
  }
}
