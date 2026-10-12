# Module 5: API Integration with a C# Backend (about 2.5 hours)

| # | Problem | Level | Time | Tests |
|---|---|---|---|---|
| — | [Quick-fire Q&A](./QUICKFIRE.md) | — | 15 min | (out loud) |
| 5.1 | [A Production API Client](./01-api-client/README.md) | Intermediate+ | 35 min | 13 |
| 5.2 | [Retries with Backoff](./02-retry/README.md) | Advanced | 30 min | 12 |
| 5.3 | [Server-Side Validation Errors](./03-server-validation/README.md) | Advanced | 40 min | 11 |
| 5.4 | [Optimistic Wishlist Toggle (by hand)](./04-optimistic-wishlist/README.md) | Advanced | 30 min | 9 |

```bash
npx vitest src/module-05-api
```

All four problems share [`ApiError.ts`](./ApiError.ts), the error type every call to the C# API turns into.
**Read it first.** You don't need to edit it. The problems don't depend on each other's code, so you can do them in any order.

**The thread through this module:** *the network is unreliable and the server is the source of truth.*
Every request can be slow, fail, be cancelled, arrive out of order, or succeed after you've given up on it.
The UI's job is to stay honest about which of those happened.

| Failure | What the player should see |
|---|---|
| Validation (400) | the message next to the field that caused it |
| Conflict (409) | "it changed somewhere else, reload" |
| Unauthorized (401) | the sign-in page (handled once, in the client) |
| Rate-limited / server blip (429, 5xx) | nothing, if a quiet retry fixes it; otherwise "try again" plus a trace ID |
| Offline / network | "check your connection" |
| Cancelled | nothing at all |
