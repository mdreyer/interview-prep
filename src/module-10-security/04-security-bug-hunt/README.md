# 10.4 Bug Hunt: the Profile Card

**Difficulty:** Intermediate+ · **Suggested time:** 30 minutes
**Skills:** a security code review: XSS sinks, unsafe URLs, `eval`, `postMessage` origin checks, token storage, logging secrets

## The ticket

> A pen test of the public profile page came back with six findings, all in one component.

You'll edit `ProfileCard.tsx`. As with every bug hunt: **review it first**, as if it were a pull request, and write down each finding,
how an attacker would exploit it, and the fix. Then run the tests.

<details><summary>What the tests check (spoilers)</summary>

1. **Stored XSS:** the bio is rendered as **text**, not HTML.
2. **`javascript:` link:** the website becomes a link only for `http(s)` URLs, with `rel="noopener noreferrer"`.
3. **Code execution:** saved settings are read with `JSON.parse` (never `eval`), and the theme is validated: only `'light'` or `'dark'`, default `'light'`.
4. **`postMessage`:** theme messages are accepted only from `TRUSTED_LAUNCHER_ORIGIN`, and only in the shape `{ type: 'set-theme', theme: 'light' | 'dark' }`.
5. **Leaking listener:** the `message` listener is removed on unmount.
6. **Token theft:** the access token is never written to `localStorage` or `sessionStorage`.
7. **Secrets in logs:** the access token is never logged.
</details>

## Run the tests

```bash
npx vitest src/module-10-security/04-security-bug-hunt
```

## Be ready to answer out loud

- Why is an access token in `localStorage` a problem, if we already fixed the XSS? (Any *future* XSS bug, or a compromised npm package or third-party
  script, can read and exfiltrate it, and use it from anywhere until it expires. Keep it in memory, or use `HttpOnly` cookies (10.3).)
- Why are logs a security problem? (Browser logs end up in session-replay tools, error trackers like Sentry or App Insights, and support screenshots.)
- Who can send your page a `postMessage`? (Any window that has a reference to it: popups, iframes, the page that opened you.) What two checks
  does every listener need? (`event.origin` against an exact allowlist, and validating `event.data`'s shape.) And when *sending*, why never use `'*'` as the target origin?
- What would you add at the platform level so the next bug like this does less damage? (A strict **CSP** without `'unsafe-eval'` or
  `'unsafe-inline'`, Trusted Types, `eslint-plugin-security` / `react/no-danger`, and a review checklist.)
- Supply-chain risk: one of your 1,500 npm dependencies gets compromised. What limits the blast radius? (Lockfiles, `npm audit` / Dependabot,
  pinning, reviewing new dependencies, Subresource Integrity for CDN scripts, a CSP `connect-src` allowlist so stolen data can't be sent anywhere.)
