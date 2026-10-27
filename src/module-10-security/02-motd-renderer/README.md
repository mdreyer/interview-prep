# 10.2 Rendering a Server MOTD Safely

**Difficulty:** Advanced · **Suggested time:** 40 minutes
**Skills:** XSS through `dangerouslySetInnerHTML`, parsing untrusted input into data, rendering data with React (which escapes it), safe linkifying

## The ticket

> The server list on Minecraft.net shows each server's MOTD (message of the day) with its `§` color codes, like the game does.
> The current version turns the codes into an HTML string and uses `dangerouslySetInnerHTML`. Anyone who runs a server can put
> `<img src=x onerror=…>` in their MOTD and run JavaScript on minecraft.net, for every visitor. Rewrite it.

You'll edit `ServerMotd.tsx`. **Don't sanitize the HTML string. Never build one.** Parse the input into plain data (text plus style), then let
React render that data as text, which it escapes automatically. That's the fix that can't regress.

## The format (Java Edition)

`§` followed by one character (case-insensitive):

| Code | Meaning |
|---|---|
| `0`–`9`, `a`–`f` | a color (names are in `COLORS`). **A color code also resets formatting.** |
| `k` / `l` / `m` / `n` / `o` | obfuscated / bold / strikethrough / underline / italic (these stack) |
| `r` | reset everything |
| anything else, or a `§` at the very end | dropped |

## Requirements

1. **`parseMotd(text)`** returns `Segment[]`: `{ text, color?, bold?, italic?, underline?, strikethrough?, obfuscated? }`. Only include
   style keys that are set. Skip empty segments, and merge neighbors with identical styles.
2. **`ServerMotd`** renders a `<p className="motd">` with one `<span>` per segment, with classes `mc-{color}`, `mc-bold`, `mc-italic`,
   `mc-underline`, `mc-strikethrough`, `mc-obfuscated` (in that order, no class attribute when unstyled).
3. **No HTML from the input, ever.** `<img …>` and `<script>` in a MOTD show up as literal text.
4. **Linkify** `http://` and `https://` URLs inside a segment as `<a href target="_blank" rel="noopener noreferrer nofollow ugc">`.
   Nothing else becomes a link (`javascript:`, `data:`…).
   <details><summary>Hint</summary><code>text.split(/(https?:\/\/[^\s]+)/)</code>: with a capture group, the URLs land at the odd indexes.</details>

## Run the tests

```bash
npx vitest src/module-10-security/02-motd-renderer
```

## Be ready to answer out loud

- Name the three kinds of XSS. Which one is this? (Stored. The others are reflected and DOM-based.)
- When *do* you need `dangerouslySetInnerHTML`? (Trusted HTML from your own CMS, or rendered Markdown.) What would you do then?
  (Sanitize with **DOMPurify** right before rendering, ideally behind a single reviewed component, and add a CSP.)
- Is escaping enough everywhere? Which contexts need different handling? (URLs (10.1), inline `<script>` JSON (escape `</script>`),
  CSS values, and attributes in non-React templates. React only protects text and attribute *values*.)
- What does a **Content Security Policy** add here? (`script-src 'self'` with no `'unsafe-inline'` blocks inline `onerror=` handlers and injected
  scripts even if an XSS bug slips through. Trusted Types go further and block `innerHTML` with plain strings.)
- What's `rel="ugc"` / `nofollow` for? (Telling search engines the link is user-generated, so spammers gain nothing from it.)
