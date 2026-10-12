# 5.1 A Production API Client

**Difficulty:** Intermediate+ · **Suggested time:** 35 minutes
**Skills:** `fetch` in depth, `URLSearchParams`, headers, ASP.NET Core `ProblemDetails`, telling "failed" apart from "cancelled"

## The ticket

> 3.3 gave us a *type-safe* client. This ticket makes it *survive production*: query strings, auth tokens,
> idempotency keys, and every way the C# API (or the network between us) can fail. Every Minecraft.net page that
> talks to the API will go through this, so error handling has to be consistent.

You'll edit `apiClient.ts`. `ApiError` is already written for you in `../ApiError.ts`. Read it first.

## Requirements

`createApiClient({ baseUrl, fetch, getAccessToken?, onUnauthorized? })` returns `{ request }`.
`request<T>(method, path, { query?, body?, signal?, idempotencyKey? })` resolves to the response body as `T`.

**The request**
1. Call `fetch(baseUrl + path + queryString, init)` with `init.method` set.
2. **Query:** build it with `URLSearchParams`. Skip `null`/`undefined` values. Arrays become **repeated keys**
   (`?tag=mobs&tag=green`), which is what ASP.NET Core binds to a `string[]` parameter. No `?` when the query is empty.
3. **Headers:** always `Accept: application/json`.
   - With a body: `Content-Type: application/json` and a `JSON.stringify`ed body. Without a body: neither.
   - If `getAccessToken` (it may be async) returns a token: `Authorization: Bearer <token>`.
   - If `idempotencyKey` is given: `Idempotency-Key: <key>`.
4. Pass `signal` through to `fetch`.

**Success**
5. `204`, or an empty body → `undefined`. Otherwise the parsed JSON.

**Failure: always throw an `ApiError`, except for cancellation**
6. Non-2xx status → `ApiError { kind: 'http', status }`. If the body is JSON (`application/json` *or*
   `application/problem+json`), copy `title`, `detail` and `traceId` from it.
7. `errors` (from ASP.NET's `ValidationProblemDetails`) becomes `fieldErrors`, with keys converted by `toCamelPath`:
   `"Address.PostalCode"` → `"address.postalCode"`. The C# side uses PascalCase property paths; your form fields are camelCase.
8. A non-JSON error body (an HTML 502 page from a load balancer) must not crash the parser. You still get an `ApiError` with the status.
9. `Retry-After: 3` (seconds) → `retryAfterMs: 3000`. 5.2 uses it.
10. `401` → call `onUnauthorized()` (the app would redirect to sign-in), then throw as usual.
11. `fetch` itself rejects (DNS, offline, CORS) → `ApiError { kind: 'network', status: 0 }`.
12. An **`AbortError`** is rethrown **unchanged**. Cancelling isn't a failure, and callers ignore it (remember 2.2).

## Run the tests

```bash
npx vitest src/module-05-api/01-api-client
```

## Be ready to answer out loud

- `fetch` doesn't reject on a 404 or a 500. When *does* it reject? Why is that a sensible design?
- Why convert errors into one `ApiError` class at the edge, instead of letting each component inspect `Response`s?
- Where should the access token live in a browser SPA: memory, `localStorage`, or an `HttpOnly` cookie? What are the trade-offs?
  (Module 10 goes deeper; with cookies you need CSRF protection, see ASP.NET's antiforgery.)
- A CORS error shows up in your client as a plain `TypeError` with no status. Why can't JavaScript see the details?
- The C# API returns order IDs as `long`. What can go wrong when `JSON.parse` meets `9007199254740993`?
