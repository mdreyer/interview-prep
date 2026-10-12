# 5.2 Retries with Backoff

**Difficulty:** Advanced · **Suggested time:** 30 minutes
**Skills:** async control flow, exponential backoff with jitter, `Retry-After`, cancellation with `AbortSignal`, knowing what's safe to retry

## The ticket

> When the Realms service restarts, every open Minecraft.net tab hammers it with failed requests, and players see
> "Something went wrong" for a blip that lasted two seconds. Add a retry helper, but don't make the
> thundering herd worse, and never retry something that can't succeed.

You'll edit `withRetry.ts`. It uses the `ApiError` from 5.1 (`../ApiError.ts`), but doesn't need your 5.1 code.

## Requirements

`withRetry(operation, options)` calls `operation(attempt)` (`attempt` is 0 for the first try) and resolves with its result.

1. **What to retry** (`isRetryable(error)`, the default `shouldRetry`):
   - `ApiError` with `kind: 'network'` → yes
   - `ApiError` with status `408`, `429`, `500`, `502`, `503`, `504` → yes
   - everything else → no: other 4xx errors, `AbortError`s, and plain JS errors (a `TypeError` is a bug, and retrying won't fix it)
2. **How many times:** up to `retries` retries after the first attempt (default 3). When they run out, or the error
   isn't retryable, throw **the last error itself** (not a new one).
3. **How long to wait** before retry *n* (n = 1, 2, 3…), using "full jitter":
   `random() × min(maxDelayMs, baseDelayMs × 2^(n-1))`, rounded to a whole number of milliseconds.
   With the defaults (200 / 5000) and `random = () => 1`, that's 200, 400, 800.
4. **Server knows best:** if the error has `retryAfterMs` (from a `Retry-After` header, see 5.1), wait exactly that,
   still capped at `maxDelayMs`.
5. Call `onRetry({ attempt: n, delayMs, error })` before each wait. In a real app, this is where you'd log, or show "Retrying…".
6. **Cancellation:** if `signal` is aborted before an attempt, or **during a wait**, stop right away and reject with an
   `AbortError` (use `signal.reason` if it's set). `defaultSleep(ms, signal)` must reject early when the signal aborts,
   and must clean up after itself.

## Run the tests

```bash
npx vitest src/module-05-api/02-retry
```

## Be ready to answer out loud

- Why add **jitter**? Picture 50,000 open tabs whose requests all failed in the same second.
- `GET` is safe to retry. Is `POST /api/orders`? What makes it safe? (An **idempotency key**: the client generates it
  once per *intent* and sends the same key on every retry, and the C# API stores the result per key.)
- Why is `401` not retryable, even though logging in again would fix it? Who should handle it instead?
- Where would you put retries: in the API client, in each call site, or in a data library like TanStack Query
  (which retries 3 times by default)? What's the risk of doing it in two layers at once?
