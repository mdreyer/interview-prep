import { describe, expect, it, vi } from 'vitest';
import { createSecureFetch, getCookie } from './secureFetch';

const API = 'https://api.minecraft.example';

function setup(responses: Response[] = []) {
  let cookies = 'theme=dark; XSRF-TOKEN=tok%2Fone%3D%3D; session_hint=1';
  const fetchMock = vi.fn(async (_url: string, _init?: RequestInit) => responses.shift() ?? new Response('{}', { status: 200 }));
  const refreshToken = vi.fn(async () => {
    cookies = 'theme=dark; XSRF-TOKEN=tok-two';
  });
  const secureFetch = createSecureFetch({
    apiOrigin: API,
    fetch: fetchMock as unknown as typeof fetch,
    getCookieString: () => cookies,
    refreshToken,
  });
  const call = (i = 0) => {
    const [url, init] = fetchMock.mock.calls[i]!;
    return { url, init: init!, headers: new Headers(init!.headers) };
  };
  return { secureFetch, fetchMock, refreshToken, call };
}

const antiforgeryFailure = () => new Response('', { status: 400, headers: { 'X-Antiforgery-Failed': 'true' } });

describe('10.3 getCookie', () => {
  it('finds a cookie by exact name and decodes it', () => {
    const jar = 'theme=dark; XSRF-TOKEN=abc%3D%3D; MY-XSRF-TOKEN=wrong; empty=';
    expect(getCookie('XSRF-TOKEN', jar)).toBe('abc==');
    expect(getCookie('theme', jar)).toBe('dark');
    expect(getCookie('empty', jar)).toBe('');
    expect(getCookie('missing', jar)).toBeNull();
    expect(getCookie('XSRF', jar)).toBeNull();
  });

  it("keeps '=' inside values, and copes with no spaces or a malformed value", () => {
    expect(getCookie('a', 'a=b=c;d=e')).toBe('b=c');
    expect(getCookie('d', 'a=b=c;d=e')).toBe('e');
    expect(getCookie('bad', 'bad=%E0%A4%A')).toBe('%E0%A4%A');
  });
});

describe('10.3 createSecureFetch', () => {
  it('sends the antiforgery token header on state-changing requests to our API, with cookies included', async () => {
    const { secureFetch, call } = setup();
    await secureFetch('/api/wishlist/skin-1', { method: 'POST' });
    expect(call().url).toBe(`${API}/api/wishlist/skin-1`);
    expect(call().headers.get('X-XSRF-TOKEN')).toBe('tok/one==');
    expect(call().init.credentials).toBe('include');
  });

  it('does it for PUT, PATCH and DELETE too (any case), but not for GET or HEAD', async () => {
    const { secureFetch, call } = setup();
    await secureFetch('/api/profile', { method: 'put' });
    await secureFetch('/api/profile', { method: 'PATCH' });
    await secureFetch('/api/wishlist/1', { method: 'DELETE' });
    await secureFetch('/api/profile');
    await secureFetch('/api/profile', { method: 'HEAD' });
    expect([0, 1, 2].map((i) => call(i).headers.get('X-XSRF-TOKEN'))).toEqual(['tok/one==', 'tok/one==', 'tok/one==']);
    expect(call(3).headers.has('X-XSRF-TOKEN')).toBe(false);
    expect(call(4).headers.has('X-XSRF-TOKEN')).toBe(false);
    expect(call(3).init.credentials).toBe('include');
  });

  it("keeps the caller's own headers and body", async () => {
    const { secureFetch, call } = setup();
    await secureFetch('/api/orders', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{"sku":"MC-1720"}' });
    expect(call().headers.get('Content-Type')).toBe('application/json');
    expect(call().init.body).toBe('{"sku":"MC-1720"}');
  });

  it('never sends the token, or cookies, to another origin', async () => {
    const { secureFetch, call } = setup();
    await secureFetch('https://cdn.partner.example/upload', { method: 'POST', headers: { 'X-XSRF-TOKEN': 'tok/one==' } });
    expect(call().headers.has('X-XSRF-TOKEN')).toBe(false);
    expect(call().init.credentials).toBe('omit');
  });

  it('treats a lookalike host as another origin', async () => {
    const { secureFetch, call } = setup();
    await secureFetch('https://api.minecraft.example.evil.example/steal', { method: 'POST' });
    await secureFetch('http://api.minecraft.example/api/profile', { method: 'POST' }); // http, not https
    expect(call(0).headers.has('X-XSRF-TOKEN')).toBe(false);
    expect(call(1).headers.has('X-XSRF-TOKEN')).toBe(false);
  });

  it('when the API says the antiforgery token is stale: refreshes it once and retries once with the new token', async () => {
    const { secureFetch, call, refreshToken, fetchMock } = setup([antiforgeryFailure(), new Response('{"ok":true}', { status: 200 })]);
    const res = await secureFetch('/api/realms/42/invite', { method: 'POST' });
    expect(res.status).toBe(200);
    expect(refreshToken).toHaveBeenCalledTimes(1);
    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(call(1).headers.get('X-XSRF-TOKEN')).toBe('tok-two');
  });

  it("doesn't loop: a second antiforgery failure is returned to the caller", async () => {
    const { secureFetch, refreshToken, fetchMock } = setup([antiforgeryFailure(), antiforgeryFailure()]);
    const res = await secureFetch('/api/realms/42/invite', { method: 'POST' });
    expect(res.status).toBe(400);
    expect(refreshToken).toHaveBeenCalledTimes(1);
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it("an ordinary 400 (validation) isn't retried", async () => {
    const { secureFetch, refreshToken, fetchMock } = setup([new Response('{"title":"Bad gamertag"}', { status: 400 })]);
    const res = await secureFetch('/api/profile', { method: 'PUT' });
    expect(res.status).toBe(400);
    expect(refreshToken).not.toHaveBeenCalled();
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });
});
