# Module 9: Internationalization (about 2.25 hours)

| # | Problem | Level | Time | Tests |
|---|---|---|---|---|
| — | [Quick-fire Q&A](./QUICKFIRE.md) | — | 15 min | (out loud) |
| 9.1 | [Formatting with `Intl`](./01-intl-formatting/README.md) | Intermediate | 25 min | 7 |
| 9.2 | [A Plural-Aware Translator](./02-translator/README.md) | Intermediate+ | 35 min | 10 |
| 9.3 | [Locale Provider, Language Picker, and Right-to-Left](./03-locale-provider/README.md) | Intermediate+ | 40 min | 9 |
| 9.4 | [Bug Hunt: the Season Leaderboard](./04-i18n-bug-hunt/README.md) | Intermediate | 30 min | 10 |

```bash
npx vitest src/module-09-i18n
```

**The thread through this module:** *never build human-readable text by hand.* Numbers, money, dates, lists, plurals and even
alphabetical order depend on the reader's locale, and the browser already ships the rules for all of them (CLDR, through `Intl`).

| Instead of… | Use… |
|---|---|
| `'$' + (cents / 100).toFixed(2)` | `Intl.NumberFormat(locale, { style: 'currency', currency })` |
| `n + ' days ago'` | `Intl.RelativeTimeFormat` |
| `names.join(', ')` | `Intl.ListFormat` |
| `n === 1 ? 'item' : 'items'` | `Intl.PluralRules` (or ICU messages) |
| `a < b` for names | `Intl.Collator` |
| `date.toLocaleDateString()` | `Intl.DateTimeFormat(locale, { …, timeZone })` |
| `{ DE: 'Germany' }` | `Intl.DisplayNames` |
| `margin-left` | `margin-inline-start` |

Minecraft ships in more languages than almost any game, so expect at least one i18n question for a Minecraft.net role.
