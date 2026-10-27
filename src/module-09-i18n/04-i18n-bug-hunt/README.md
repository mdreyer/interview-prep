# 9.4 Bug Hunt: the Season Leaderboard

**Difficulty:** Intermediate · **Suggested time:** 30 minutes
**Skills:** spotting i18n bugs in review: collation, number, percent, region, relative-time, list and date formatting, logical CSS

## The ticket

> The season leaderboard was built and tested in `en-US`. German players report "1234567" scores, English country names,
> "0 days ago", and a season end date that's a day off for players in Japan. Arabic is next quarter.

You'll edit `Leaderboard.tsx`. Like the other bug hunts: **read it first and list every bug you can find** before running the tests.
There are seven kinds. (The column headers stay in English for this exercise, since 9.2 is how you'd translate them.)

Every fix is an `Intl` API you've already used in 9.1, plus one you haven't: **`Intl.Collator`**.

<details><summary>What the tests check (spoilers)</summary>

1. Score ties are broken alphabetically with the locale's collation (`Ana, émile, Zoe`), not by UTF-16 code units (`Ana, Zoe, émile`).
2. Scores use the locale's number format (`1,234,567` / `1.234.567`).
3. Win rates use the locale's **percent** format (`85%` / `85 %`).
4. Countries are named in the reader's language with `Intl.DisplayNames` (`Deutschland`), not a hard-coded English map.
5. "Last played" uses `Intl.RelativeTimeFormat` with `numeric: 'auto'` in whole days: `today`, `yesterday`, `3 days ago` / `heute`, `gestern`, `vorgestern`.
6. The country list uses `Intl.ListFormat` (`Deutschland, Brasilien und Japan`).
7. The season end is `dateStyle: 'long'` **in the `timeZone` prop**, not the computer's.
8. Inline styles use logical values (`textAlign: 'start' | 'end'`, `paddingInlineStart` / `paddingInlineEnd`), never `left` / `right`.
</details>

## Run the tests

```bash
npx vitest src/module-09-i18n/04-i18n-bug-hunt
```

## Be ready to answer out loud

- Why is `a.name < b.name` wrong for sorting names, even in English? (It compares UTF-16 code units: all uppercase letters sort before all
  lowercase ones, and accented letters after `z`.) What would you use for a 10,000-row sort? (Create one `Intl.Collator` and pass `collator.compare`.)
- Swedish sorts `Å` and `Ö` after `Z`, and German sorts `Ö` with `O`. Who decides the order, the data or the reader? (The reader's locale.)
- Should the **server** sort the leaderboard? If it pages results, it must. Then which collation does SQL Server use, and does it match the player's locale?
- Should numbers in Arabic use Arabic-Indic digits? Who decides? (CLDR defaults per locale, and the `-u-nu-` extension overrides it: `ar-EG-u-nu-latn`.)
- How would you stop these bugs coming back? (A lint rule banning `toFixed`/`toLocaleString()` without a locale and string concatenation in JSX,
  tests that render in several locales (as here), and pseudo-localization.)
