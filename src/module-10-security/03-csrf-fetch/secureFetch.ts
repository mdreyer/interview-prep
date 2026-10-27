// 10.3 secureFetch. The spec is in README.md in this folder.

/** Reads one cookie's value from a `document.cookie`-style string, or null. */
export function getCookie(name: string, cookieString: string): string | null {
  // TODO
  return null;
}

export const CSRF_COOKIE = 'XSRF-TOKEN';
export const CSRF_HEADER = 'X-XSRF-TOKEN';
export const ANTIFORGERY_FAILED_HEADER = 'X-Antiforgery-Failed';

export interface SecureFetchConfig {
  /** e.g. "https://api.minecraft.example" */
  apiOrigin: string;
  fetch: typeof fetch;
  /** Default: () => document.cookie */
  getCookieString?: () => string;
  /** Asks the API for a fresh antiforgery cookie (GET /api/antiforgery/token). */
  refreshToken: () => Promise<void>;
}

export function createSecureFetch({ apiOrigin, fetch: fetchImpl, getCookieString = () => document.cookie, refreshToken }: SecureFetchConfig) {
  return async function secureFetch(input: string, init: RequestInit = {}): Promise<Response> {
    // TODO: build it!
    return fetchImpl(input, init);
  };
}
