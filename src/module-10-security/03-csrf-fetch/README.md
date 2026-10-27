# 10.3 CSRF Protection with ASP.NET Core Antiforgery

**Difficulty:** Advanced · **Suggested time:** 35 minutes
**Skills:** how CSRF works, the double-submit cookie pattern, parsing `document.cookie`, same-origin checks with `URL`, `credentials`, refresh-and-retry-once

## The ticket

> We're moving the account pages from bearer tokens in `localStorage` to an `HttpOnly` session cookie (so XSS can't steal tokens).
> Cookies are sent automatically, so now we need CSRF protection. The C# API uses ASP.NET Core antiforgery: it sets a readable
> `XSRF-TOKEN` cookie, and every state-changing request must echo it back in an `X-XSRF-TOKEN` header. Wrap `fetch` so nobody has to remember.

You'll edit `secureFetch.ts`.

## Requirements

**`getCookie(name, cookieString)`**
1. Parse a `document.cookie` string (`"a=1; XSRF-TOKEN=abc%3D%3D; b=2"`). Match the name **exactly** (`MY-XSRF-TOKEN` is not `XSRF-TOKEN`),
   split on the **first** `=` only (values can contain `=`), `decodeURIComponent` the value (keep it raw if that throws), and return `null` if missing.

**`createSecureFetch({ apiOrigin, fetch, getCookieString, refreshToken })`** returns `secureFetch(input, init)`:
2. Resolve `input` against `apiOrigin` with `new URL(input, apiOrigin)`, and call `fetch` with the full URL.
3. **Requests to the API's origin** (compare `URL.origin` values: scheme, host and port, not string prefixes): `credentials: 'include'`.
   For **state-changing methods** (anything except `GET`, `HEAD`, `OPTIONS`, `TRACE`, in any case), add `X-XSRF-TOKEN` with the cookie's value.
4. **Requests anywhere else:** `credentials: 'omit'`, and **never** send `X-XSRF-TOKEN`, even if the caller passed it.
5. Keep the caller's other headers and body.
6. **Stale token:** if our API answers `400` with the header `X-Antiforgery-Failed: true`, call `refreshToken()` **once**, then retry **once**,
   reading the cookie again. Return whatever the retry returns. Any other `400` is returned as is.

## Run the tests

```bash
npx vitest src/module-10-security/03-csrf-fetch
```

## Be ready to answer out loud

- Explain CSRF in two sentences. (Another site makes the player's browser send a request to us, and the browser attaches our cookies automatically.
  We can't tell it apart from a real request unless it carries something the other site can't read.)
- Why does this pattern work if the token is in a cookie the browser sends anyway? (The attacker's page can make the browser *send* our cookie,
  but it can't *read* it to copy it into a header. That's the same-origin policy.)
- What does `SameSite=Lax` already prevent, and why keep antiforgery tokens anyway? (Lax blocks cookies on cross-site POSTs, but not on top-level GET
  navigations, and some sites need `None` for embeds. Defense in depth.)
- Why is a `GET` that changes state (`GET /api/wishlist/add?id=1`) a CSRF bug no matter what? (An `<img src>` can trigger it. Safe methods must not change state.)
- CSRF vs. CORS: which protects what? (CORS controls who can **read** responses. It doesn't stop the request from being *sent*. CSRF tokens stop
  forged requests from being **accepted**.) Does a strict CORS policy alone stop CSRF? (No: simple form POSTs need no preflight.)
