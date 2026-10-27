# 9.3 Locale Provider, Language Picker, and Right-to-Left

**Difficulty:** Intermediate+ · **Suggested time:** 40 minutes
**Skills:** locale negotiation, `<html lang>` and `dir`, Context (4.3's Create, Provide, Hook), `Intl.DisplayNames`, validating stored preferences

## The ticket

> Minecraft.net picks the language from the URL only, ignores the browser's language settings, forgets your choice, and when we
> turned on Arabic the whole layout stayed left-to-right. Build the client-side locale layer.

You'll edit `i18n.tsx`.

## Requirements

**Pure helpers**
1. `negotiateLocale(requested, supported = SUPPORTED_LOCALES, fallback = 'en')`: go through `requested` (the browser's
   `navigator.languages`) **in order**. For each one, take an exact match (case-insensitive) if there is one, otherwise any
   supported locale with the **same base language** (`de-AT` → `de`, `pt-PT` → `pt-BR`). Only then move on to the next requested
   locale. Nothing matches → `fallback`.
2. `getDirection(locale)`: `'rtl'` for Arabic, Hebrew, Persian and Urdu (`ar`, `he`, `fa`, `ur`, with any region), otherwise `'ltr'`.

**`I18nProvider` + `useI18n()`**
3. The initial locale is the **saved** choice from `localStorage[STORAGE_KEY]`, **if it's a supported locale**. Otherwise negotiate from the
   `requestedLocales` prop (it defaults to `navigator.languages`).
   - Validate what you read: storage is user-controlled input (from old versions, other scripts, or a curious player).
   - `localStorage` can **throw** (privacy modes, blocked storage). The app must still work.
4. Keep `document.documentElement.lang` and `.dir` in sync with the current locale.
5. `useI18n()` returns `{ locale, dir, setLocale, formatNumber }`. `setLocale` saves the choice. `formatNumber` formats with the current locale.
   Called outside the provider, it throws an error that mentions `I18nProvider`.

**`LanguagePicker`**
6. A `<select>` labelled `Language`, with one option per supported locale (`value` = the code). Show each language's name **in that language**
   (`Deutsch`, `日本語`, `العربية`…) using `Intl.DisplayNames`, and put `lang={code}` on each option so screen readers pronounce it correctly.

## Run the tests

```bash
npx vitest src/module-09-i18n/03-locale-provider
```

## Be ready to answer out loud

- Why name languages in their own language, and not with flags? (Flags are countries, not languages: which flag is Spanish? Portuguese?)
- Setting `dir="rtl"` flips text, but what about your CSS? (Use **logical properties**: `margin-inline-start` instead of `margin-left`,
  `padding-inline`, `inset-inline-end`, `text-align: start`. Mirror directional icons like arrows, but not logos, media controls or clocks.)
- Where should the locale live: a cookie, the URL (`/de-de/`, like minecraft.net), `localStorage`, or the account profile? (The URL is
  shareable and good for SEO; the server needs it for SSR; the profile follows the player across devices.)
- Why does `<html lang>` matter for accessibility and SEO? (Screen-reader pronunciation, browser translation offers, hyphenation, search indexing.)
- What's the hydration risk of reading `localStorage` or `navigator.languages` during the first render with SSR? (The server can't
  see them, so the first client render differs. 2.3's `getServerSnapshot` was the same problem.)
