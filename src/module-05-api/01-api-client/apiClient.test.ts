import { describe, expect, it, vi } from 'vitest';
import { ApiError } from '../ApiError';
import { createApiClient, toCamelPath } from './apiClient';

const BASE = 'https://api.minecraft.example';

function json(body: unknown, status = 200, headers: Record<string, string> = {}) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json; charset=utf-8', ...headers },
  });
}
function problem(body: unknown, status: number, headers: Record<string, string> = {}) {
  return json(body, status, { 'Content-Type': 'application/problem+json', ...headers });
}
function setup(response: () => Response | Promise<Response>, extra: Record<string, unknown> = {}) {
  const fetchMock = vi.fn(async (_url: string, _init?: RequestInit) => response());
  const client = createApiClient({ baseUrl: BASE, fetch: fetchMock as unknown as typeof fetch, ...extra });
  const call = (i = 0) => {
    const [url, init] = fetchMock.mock.calls[i]!;
    return { url, init: init!, headers: new Headers(init!.headers) };
  };
  return { client, fetchMock, call };
}

async function caught(promise: Promise<unknown>): Promise<ApiError> {
  try {
    await promise;
  } catch (error) {
    return error as ApiError;
  }
  throw new Error('expected the request to throw, but it resolved');
}

describe('5.1 apiClient', () => {
  it('GETs baseUrl + path with Accept: application/json and returns the parsed JSON', async () => {
    const { client, call } = setup(() => json({ gamertag: 'Alex_Builds', minecoins: 1720 }));
    const profile = await client.request<{ gamertag: string }>('GET', '/api/profile');
    expect(profile).toEqual({ gamertag: 'Alex_Builds', minecoins: 1720 });
    expect(call().url).toBe(`${BASE}/api/profile`);
    expect(call().init.method).toBe('GET');
    expect(call().headers.get('Accept')).toBe('application/json');
    expect(call().init.body).toBeUndefined();
  });

  it('builds the query string: encodes values, skips null/undefined, repeats array keys', async () => {
    const { client, call } = setup(() => json([]));
    await client.request('GET', '/api/skins', {
      query: { q: 'creeper & co', page: 2, tag: ['mobs', 'green'], cursor: undefined, author: null },
    });
    const url = new URL(call().url);
    expect(url.origin + url.pathname).toBe(`${BASE}/api/skins`);
    expect(url.searchParams.get('q')).toBe('creeper & co');
    expect(url.searchParams.get('page')).toBe('2');
    expect(url.searchParams.getAll('tag')).toEqual(['mobs', 'green']);
    expect(url.searchParams.has('cursor')).toBe(false);
    expect(url.searchParams.has('author')).toBe(false);
  });

  it('sends a JSON body with Content-Type, plus Authorization and Idempotency-Key headers when available', async () => {
    const { client, call } = setup(() => json({ orderId: 'o-1' }, 201), {
      getAccessToken: async () => 'tok-123',
    });
    const result = await client.request('POST', '/api/orders', {
      body: { bundleId: 'explorer', quantity: 2 },
      idempotencyKey: 'key-abc',
    });
    expect(result).toEqual({ orderId: 'o-1' });
    expect(call().init.method).toBe('POST');
    expect(call().init.body).toBe(JSON.stringify({ bundleId: 'explorer', quantity: 2 }));
    expect(call().headers.get('Content-Type')).toBe('application/json');
    expect(call().headers.get('Authorization')).toBe('Bearer tok-123');
    expect(call().headers.get('Idempotency-Key')).toBe('key-abc');
  });

  it('leaves out Authorization when there is no token, and Content-Type when there is no body', async () => {
    const { client, call } = setup(() => json({}), { getAccessToken: () => null });
    await client.request('GET', '/api/news');
    expect(call().headers.has('Authorization')).toBe(false);
    expect(call().headers.has('Content-Type')).toBe(false);
  });

  it('passes the AbortSignal through to fetch', async () => {
    const { client, call } = setup(() => json({}));
    const controller = new AbortController();
    await client.request('GET', '/api/news', { signal: controller.signal });
    expect(call().init.signal).toBe(controller.signal);
  });

  it('resolves to undefined for 204 No Content (and for an empty 200 body)', async () => {
    const noContent = setup(() => new Response(null, { status: 204 }));
    await expect(noContent.client.request('DELETE', '/api/wishlist/skin-1')).resolves.toBeUndefined();
    const empty = setup(() => new Response('', { status: 200 }));
    await expect(empty.client.request('PUT', '/api/settings', { body: {} })).resolves.toBeUndefined();
  });

  it('turns an ASP.NET ValidationProblemDetails 400 into an ApiError with camelCase fieldErrors', async () => {
    const { client } = setup(() =>
      problem(
        {
          type: 'https://tools.ietf.org/html/rfc9110#section-15.5.1',
          title: 'One or more validation errors occurred.',
          status: 400,
          traceId: '00-abc123-01',
          errors: {
            Gamertag: ['Gamertag is already taken.'],
            'Address.PostalCode': ['The PostalCode field is required.'],
          },
        },
        400,
      ),
    );
    const error = await caught(client.request('PUT', '/api/profile', { body: { gamertag: 'Notch' } }));
    expect(error).toBeInstanceOf(ApiError);
    expect(error.kind).toBe('http');
    expect(error.status).toBe(400);
    expect(error.title).toBe('One or more validation errors occurred.');
    expect(error.message).toBe('One or more validation errors occurred.');
    expect(error.traceId).toBe('00-abc123-01');
    expect(error.fieldErrors).toEqual({
      gamertag: ['Gamertag is already taken.'],
      'address.postalCode': ['The PostalCode field is required.'],
    });
  });

  it('copes with a non-JSON error body (an HTML 502 page from a proxy)', async () => {
    const { client } = setup(
      () => new Response('<html><body>Bad Gateway</body></html>', { status: 502, headers: { 'Content-Type': 'text/html' } }),
    );
    const error = await caught(client.request('GET', '/api/profile'));
    expect(error).toBeInstanceOf(ApiError);
    expect(error.status).toBe(502);
    expect(error.message).toBe('Request failed with status 502');
    expect(error.fieldErrors).toEqual({});
  });

  it('reads Retry-After (seconds) into retryAfterMs on a 429', async () => {
    const { client } = setup(() => problem({ title: 'Too Many Requests', status: 429 }, 429, { 'Retry-After': '3' }));
    const error = await caught(client.request('GET', '/api/skins'));
    expect(error.status).toBe(429);
    expect(error.retryAfterMs).toBe(3000);
  });

  it('calls onUnauthorized on a 401, and still throws', async () => {
    const onUnauthorized = vi.fn();
    const { client } = setup(() => problem({ title: 'Unauthorized', status: 401 }, 401), { onUnauthorized });
    const error = await caught(client.request('GET', '/api/profile'));
    expect(error.status).toBe(401);
    expect(onUnauthorized).toHaveBeenCalledTimes(1);
  });

  it("wraps network failures in ApiError { kind: 'network', status: 0 }", async () => {
    const { client } = setup(() => Promise.reject(new TypeError('Failed to fetch')));
    const error = await caught(client.request('GET', '/api/profile'));
    expect(error).toBeInstanceOf(ApiError);
    expect(error.kind).toBe('network');
    expect(error.status).toBe(0);
  });

  it('rethrows an AbortError untouched, so callers can tell "cancelled" from "failed"', async () => {
    const abort = new DOMException('The operation was aborted.', 'AbortError');
    const { client } = setup(() => Promise.reject(abort));
    const error = await caught(client.request('GET', '/api/profile'));
    expect(error).toBe(abort);
  });

  it('toCamelPath converts C# property paths', () => {
    expect(toCamelPath('Gamertag')).toBe('gamertag');
    expect(toCamelPath('Address.PostalCode')).toBe('address.postalCode');
    expect(toCamelPath('Items[0].Quantity')).toBe('items[0].quantity');
  });
});
