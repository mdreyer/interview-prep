# Module 10 Quick-Fire (about 15 minutes, out loud)

**1. What are the three kinds of XSS?**
<details><summary>Answer</summary>

**Stored:** the payload is saved on the server (a bio, an MOTD) and served to every visitor. **Reflected:** it comes from the request (a URL parameter)
and is echoed straight back. **DOM-based:** client-side JS moves untrusted data (`location.hash`, `postMessage`) into a dangerous sink (`innerHTML`,
`eval`, `href`) without the server being involved. React prevents most of the first two by escaping text; the third is all on you.
</details>

**2. What does a Content Security Policy do? Give a strong one for an SPA.**
<details><summary>Answer</summary>

An HTTP header telling the browser which sources may load scripts, styles, images, frames, and where `fetch` may connect. Even if XSS gets in,
the injected script can't run or can't send data out. A strong start: `default-src 'self'; script-src 'self' 'nonce-…' 'strict-dynamic';
object-src 'none'; base-uri 'none'; frame-ancestors 'none'; connect-src 'self' https://api.minecraft.example`. Roll it out with
`Content-Security-Policy-Report-Only` first.
</details>

**3. What's clickjacking, and how do you prevent it?**
<details><summary>Answer</summary>

An attacker loads your page in an invisible iframe over their own and tricks the player into clicking "Buy" or "Delete". Prevent it with
`Content-Security-Policy: frame-ancestors 'none'` (or a specific allowlist), or the older `X-Frame-Options: DENY`.
</details>

**4. `SameSite=Strict`, `Lax`, `None`: what's the difference?**
<details><summary>Answer</summary>

**Strict:** the cookie is never sent on cross-site requests, even when following a link (you'd arrive signed out). **Lax** (the browser default):
sent on top-level GET navigations, but not on cross-site POSTs, iframes or `fetch`. **None:** always sent, and must be `Secure`. Needed for
cross-site embeds, and it means you rely fully on CSRF tokens.
</details>

**5. Where should a SPA keep an auth token?**
<details><summary>Answer</summary>

Best: not in JavaScript at all. An `HttpOnly; Secure; SameSite` session cookie, often via a **BFF** (backend-for-frontend) that holds the OAuth
tokens server-side. If the SPA must hold a token: in memory only, short-lived, refreshed with a refresh token in an `HttpOnly` cookie. Avoid
`localStorage`: any XSS or malicious dependency can read it.
</details>

**6. What can't you keep secret in a frontend bundle?**
<details><summary>Answer</summary>

Anything. API keys, "hidden" feature flags, admin routes, internal URLs: everything shipped to the browser is readable. Vite exposes `VITE_*` env vars
in the bundle by design. Real secrets stay on the server. Public keys meant for the browser (analytics, maps) should be restricted by domain or quota.
</details>

**7. What's Subresource Integrity?**
<details><summary>Answer</summary>

`<script src="https://cdn…/lib.js" integrity="sha384-…" crossorigin="anonymous">`: the browser refuses to run the file if its hash doesn't match,
so a compromised CDN can't swap in malicious code. It only works for files that never change at that URL.
</details>

**8. Name a few OWASP Top 10 items a frontend engineer influences directly.**
<details><summary>Answer</summary>

**Injection** (XSS is in this category now), **Broken Access Control** (never rely on hiding a button: the API must check permissions),
**Security Misconfiguration** (CSP and headers, verbose errors), **Vulnerable and Outdated Components** (npm dependencies),
**Identification and Authentication Failures** (token handling, session timeout), and **Software and Data Integrity Failures** (SRI, CI pipeline security).
</details>

**9. Is it safe to put user input into a `<script>` tag as JSON, e.g. for SSR state?**
<details><summary>Answer</summary>

Only if you escape it for that context. `JSON.stringify` doesn't escape `</script>`, so a bio containing `</script><script>alert(1)</script>` breaks
out. Escape `<` as `<` (frameworks like Next.js do this), or deliver the data in a `type="application/json"` script with escaping, or fetch it instead.
</details>

**10. A designer wants players to style their bio with bold, italics and links. How do you do it safely?**
<details><summary>Answer</summary>

Don't accept HTML. Accept a tiny markup language (a Markdown subset, or Minecraft-style codes like 10.2), parse it into data, and render the data
with React. If you must accept HTML, sanitize it with DOMPurify using a strict allowlist of tags and attributes, re-check link protocols, add
`rel="nofollow ugc noopener"`, and sanitize on the server too, when it's saved.
</details>
