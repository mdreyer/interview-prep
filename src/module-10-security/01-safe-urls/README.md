# 10.1 Safe Redirects and Links

**Difficulty:** Intermediate+ · **Suggested time:** 30 minutes
**Skills:** open redirects, `javascript:` URLs, parsing URLs with `URL` instead of string checks, `rel="noopener noreferrer"`

## The ticket

> Security review findings: (1) `minecraft.net/login?returnUrl=https://minecraft-free-coins.example` signs the player in and then sends
> them to a phishing site that looks like ours. (2) Players can set their profile "website" to `javascript:...`, and anyone who clicks it
> runs that script on our domain.

You'll edit `safeUrls.tsx`.

## Requirements

**`safeRedirectPath(returnUrl, fallback = '/')`**: for redirects after sign-in. Return a **same-site path** or `fallback`:
1. Empty / `null` / `undefined` → `fallback`.
2. It must start with exactly one `/`. Reject `//evil.example` (protocol-relative) and `/\evil.example` (browsers treat `\` as `/`).
3. **Don't trust string checks alone.** The URL parser silently removes tabs and newlines, so `"/\t/evil.example"` passes a
   `startsWith('//')` check but navigates to `evil.example`. Parse it with `new URL(returnUrl, someBase)` and confirm the origin didn't change.
4. Return the parsed `pathname + search + hash`.

**`safeExternalHref(input)`**: for links players type in. Return the normalized `href` for absolute `http:` / `https:` URLs, otherwise
`undefined`. That rules out `javascript:` (in any capitalization, with leading spaces), `data:`, `vbscript:`, relative URLs, and `www.example.com`
with no scheme. Use an **allowlist** of protocols, never a blocklist.

**`<ExternalLink href>`**
5. Safe URL → an `<a>` with `target="_blank"` and `rel="noopener noreferrer"`, plus visually hidden text ` (opens in a new tab)`.
6. Unsafe URL → just the text, not a link.

## Run the tests

```bash
npx vitest src/module-10-security/01-safe-urls
```

## Be ready to answer out loud

- Why is an open redirect dangerous if it only sends people to *another* site? (Phishing that starts on a trusted domain, and stolen OAuth
  codes or tokens when the redirect is part of a sign-in flow.)
- Why an allowlist of protocols rather than blocking `javascript:`? (Every new trick (`JaVaScRiPt:`, encoded characters, `vbscript:`, `data:`) gets through a blocklist.)
- What does `rel="noopener"` prevent? (The opened page getting `window.opener` and redirecting your tab to a fake login: "reverse tabnabbing".)
  Modern browsers imply `noopener` for `target="_blank"`. Why add it anyway? What does `noreferrer` add?
- React 19 blocks `javascript:` URLs in `href`. Why should you still validate? (Defense in depth, other sinks like `window.location = url` and
  `window.open(url)`, and server-rendered emails or pages that aren't React at all.)
- Where else must this check happen? (**On the server**: the C# sign-in endpoint must validate `returnUrl` too, e.g. ASP.NET's `Url.IsLocalUrl()`.)
