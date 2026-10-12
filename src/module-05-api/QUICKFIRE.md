# Module 5 Quick-Fire (about 15 minutes, out loud)

The C# questions here aren't asking you to write C#. They're the questions a frontend engineer gets when the
backend is ASP.NET Core and the interviewer wants to know you can work across the boundary.

---

**1. What is CORS, and what triggers a preflight request?**
<details><summary>Answer</summary>

The browser blocks JavaScript from reading cross-origin responses unless the server allows it with
`Access-Control-Allow-Origin` (and friends). A **preflight** (`OPTIONS`) is sent first for "non-simple" requests:
methods other than GET/HEAD/POST, a `Content-Type` other than form/text types (so `application/json` triggers one),
or custom headers like `Authorization` or `Idempotency-Key`. CORS is enforced **by the browser to protect users**.
It's not server security: curl ignores it. In ASP.NET Core it's configured with `builder.Services.AddCors(...)` and `app.UseCors(...)`.
</details>

**2. Which HTTP methods are idempotent, and why does it matter for the frontend?**
<details><summary>Answer</summary>

GET, HEAD, PUT, DELETE and OPTIONS are idempotent: doing them twice has the same effect as once. POST (and usually PATCH) aren't.
It decides what you can **retry safely** (5.2). To make a POST safe to retry, send an **idempotency key** that the server
remembers. Generate it once per user *intent* (in the click handler), not once per attempt.
</details>

**3. Bearer token in `localStorage` vs. an `HttpOnly` cookie?**
<details><summary>Answer</summary>

`localStorage`: easy, and works cross-domain, but **any XSS can read it**. `HttpOnly` + `Secure` + `SameSite` cookie:
JavaScript can't read it, so XSS can't steal it (though XSS can still *use* it while the page is open), but you need
**CSRF protection** (SameSite=Lax/Strict helps; ASP.NET has antiforgery tokens). Many teams use a **BFF**
(backend-for-frontend) that holds tokens server-side and gives the SPA a session cookie. Module 10 goes deeper.
</details>

**4. Your C# API returns an order ID as a `long`: `9007199254740993`. What happens in the browser?**
<details><summary>Answer</summary>

`JSON.parse` turns it into a JS `number`, which loses precision above `Number.MAX_SAFE_INTEGER` (2^53 − 1), so you get
`9007199254740992`, which is **a different order**. Fix it at the contract: serialize 64-bit IDs **as strings**
(`[JsonNumberHandling(JsonNumberHandling.WriteAsString)]` in System.Text.Json), or use GUIDs. Same idea for money:
C# `decimal` should go over the wire as integer minor units or a string, never a float.
</details>

**5. How do C# types usually map to TypeScript in JSON?**
<details><summary>Answer</summary>

- **Property names:** ASP.NET Core's web defaults serialize as **camelCase** (`Gamertag` → `gamertag`). But validation
  `errors` keys stay as **C# property paths** (5.1's `toCamelPath`).
- **`DateTime` / `DateTimeOffset`** → ISO 8601 strings. Prefer `DateTimeOffset` so the offset is included, and parse it explicitly on the client.
- **Enums** → numbers by default (fragile!), or strings with `JsonStringEnumConverter` (better: a TS string-literal union).
- **Nullable reference types** (`string?`) → `string | null`.
- **`Guid`** → string.
Generate the TS types from the API's **OpenAPI** document (Swashbuckle / NSwag on the server, `openapi-typescript` on the client) so they can't drift.
</details>

**6. What's `ProblemDetails`?**
<details><summary>Answer</summary>

The RFC 9457 standard JSON error body: `type`, `title`, `status`, `detail`, `instance`, plus extensions. ASP.NET Core
produces it automatically for `[ApiController]` errors (`AddProblemDetails()`), with a `traceId`, and
`ValidationProblemDetails` adds an `errors` dictionary for model-validation failures. One shape for every error is
what makes a single `ApiError` class possible.
</details>

**7. `fetch` resolved with a 500. Why didn't it reject?**
<details><summary>Answer</summary>

`fetch` rejects only when no HTTP response arrives at all: a network failure, DNS, CORS blocking, or an abort. Any HTTP
status, even 500, is a *successful round trip*, so you check `res.ok` yourself. That's why the API client is where you convert statuses into errors.
</details>

**8. What do ETags do, for caching and for concurrency?**
<details><summary>Answer</summary>

An `ETag` is a version identifier for a resource. **Caching:** the browser sends `If-None-Match: <etag>` and gets back a
cheap `304 Not Modified` if nothing changed. **Concurrency:** the client sends `If-Match: <etag>` with a PUT, and the
server rejects with `412 Precondition Failed` (or 409) if someone else changed it first, so you don't silently overwrite
their change. In EF Core, a `[Timestamp] RowVersion` column gives you the same check in the database.
</details>

**9. REST vs. GraphQL vs. RPC-style endpoints: one line each, and when would you pick each?**
<details><summary>Answer</summary>

**REST:** resources + HTTP verbs, and HTTP caching works for free. The default for public and CRUD-ish APIs.
**GraphQL:** the client asks for exactly the fields it needs in one round trip. Great for many screens with different
data needs, but caching and authorization get harder. **RPC** (`POST /api/redeemCode`): honest about actions that
aren't really CRUD. Most real APIs mix REST and RPC. What matters more is consistency and a typed contract.
</details>

**10. How would you avoid fetching the same data from five components on one page?**
<details><summary>Answer</summary>

A client-side **server-state cache**: TanStack Query or SWR (dedupe identical requests, cache by key, refetch on focus,
retry, invalidate after mutations), or the router's loaders. Don't hand-roll a global `useEffect` + context cache.
You end up rebuilding these libraries, minus the edge cases. In an interview, saying "I'd use TanStack Query, and here's
what it does for me" is a strong answer, as long as you can also explain what it does under the hood (Modules 2 and 5).
</details>
