# Module 10: Frontend Security (about 2.25 hours)

| # | Problem | Level | Time | Tests |
|---|---|---|---|---|
| — | [Quick-fire Q&A](./QUICKFIRE.md) | — | 15 min | (out loud) |
| 10.1 | [Safe Redirects and Links](./01-safe-urls/README.md) | Intermediate+ | 30 min | 11 |
| 10.2 | [Rendering a Server MOTD Safely](./02-motd-renderer/README.md) | Advanced | 40 min | 9 |
| 10.3 | [CSRF Protection with ASP.NET Core Antiforgery](./03-csrf-fetch/README.md) | Advanced | 35 min | 10 |
| 10.4 | [Bug Hunt: the Profile Card](./04-security-bug-hunt/README.md) | Intermediate+ | 30 min | 9 |

```bash
npx vitest src/module-10-security
```

**The thread through this module:** *every string that came from outside is data, until you've proven it's safe for the place it's going.*
"Outside" means the URL, the server list, a player's profile, `localStorage`, `postMessage`, and even your own API's old data.

| Where it ends up | The danger | The fix |
|---|---|---|
| Page text | stored / reflected XSS | let React render it as text; never `dangerouslySetInnerHTML` with it (10.2, 10.4) |
| `href`, `src`, `window.location` | `javascript:` URLs, open redirects | parse with `URL`, allowlist protocols and origins (10.1) |
| `eval`, `new Function`, `setTimeout(string)` | code execution | `JSON.parse` + validation (10.4) |
| A request with cookies | CSRF | antiforgery token header, `SameSite` cookies (10.3) |
| `postMessage` | spoofed messages | check `event.origin`, validate `event.data` (10.4) |
| Storage and logs | token theft | keep secrets in memory or `HttpOnly` cookies; never log them (10.4) |

**And the server must check everything again.** Client-side checks protect players' browsers. They never protect the C# API, because
an attacker can call it with curl.
