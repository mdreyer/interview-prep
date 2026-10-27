# 9.1 Formatting with `Intl`

**Difficulty:** Intermediate · **Suggested time:** 25 minutes
**Skills:** `Intl.NumberFormat` (currency, compact), `Intl.RelativeTimeFormat`, `Intl.ListFormat`, `Intl.DateTimeFormat`, time zones

## The ticket

> Minecraft.net ships in 30+ languages, but our formatting helpers were written for the US: `$` + `toFixed(2)`, "3 days ago" glued
> together by hand, and dates in whatever time zone the build server was in. Replace them with the platform's `Intl` APIs.

You'll edit `format.ts`. Every function is a few lines once you know which `Intl` constructor and options to use.
Use MDN; that's what you'd do on the job.

## Requirements

1. **`formatMoney(minorUnits, currency, locale)`**: the C# API sends money in **minor units** (see the Module 5 quick-fire). Divide by the
   right power of ten **for that currency**: 2 decimal places for USD and EUR, **0 for JPY**, 3 for KWD. Don't hard-code 100.
   <details><summary>Hint</summary>A currency <code>NumberFormat</code>'s <code>resolvedOptions()</code> tells you its <code>maximumFractionDigits</code>.</details>
2. **`formatCompact(value, locale)`**: `1.5K`, `1.2M`, `1,2 Mio.`, `123万`.
3. **`formatRelativeTime(date, now, locale)`**: pick the unit by how far apart they are, then round:
   under a minute → seconds, under an hour → minutes, under a day → hours, under a week → days, under 30 days → weeks,
   under 365 days → months (30-day months), otherwise years. Use `numeric: 'auto'`, so you get "yesterday" and "tomorrow" instead of "1 day ago".
4. **`formatList(items, locale, type)`**: "Steve, Alex, and Notch", "Steve, Alex und Notch", or with `type: 'disjunction'`, "…or Notch".
5. **`formatDate(date, locale, timeZone)`**: `dateStyle: 'medium'` **in the given time zone**. The same instant is Oct 6 in Los Angeles and Oct 7 in Tokyo.

(The tests normalize the non-breaking spaces Intl puts in some locales, like `1 234,50 €`, so you don't need to worry about them.)

## Run the tests

```bash
npx vitest src/module-09-i18n/01-intl-formatting
```

## Be ready to answer out loud

- Why do the tests pass a time zone instead of using the computer's? Where should the time zone come from in the real app?
  (The player's profile setting, or `Intl.DateTimeFormat().resolvedOptions().timeZone` from the browser. Store instants in UTC, e.g. C#'s `DateTimeOffset`.)
- Creating an `Intl.NumberFormat` is relatively expensive. In a list of 1,000 prices, what would you do? (Create it once and reuse it: 7.1's `PRICE` constant, or a small cache keyed by locale + options.)
- Is "yesterday" 24 hours ago, or the previous calendar day? Which does a player expect at 00:30?
- Your page shows a price in the player's *currency*, formatted for their *locale*. Why are those two separate settings? (A German speaker living in Switzerland pays in CHF.)
- What's `Intl.Segmenter` for? (Splitting text into graphemes, words or sentences correctly. `'👍🏽'.length` is 4, but it's one character to a person, which matters for gamertag length limits.)
