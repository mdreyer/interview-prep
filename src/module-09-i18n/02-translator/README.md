# 9.2 A Plural-Aware Translator

**Difficulty:** Intermediate+ · **Suggested time:** 35 minutes
**Skills:** message catalogs, `Intl.PluralRules`, locale fallback chains, interpolation, why `count === 1 ? '' : 's'` is a bug

## The ticket

> The account pages say "1 items" in Polish and "2 friend online" in Arabic, because every plural is
> `n === 1 ? singular : plural`. Write the small `t()` function the whole site will use, the way i18next, FormatJS and
> Lingui work under the hood.

You'll edit `translator.ts`. In a real project you'd use one of those libraries (Minecraft.net's strings come from a localization
pipeline). But "build a tiny `t()`" is a classic interview question, and it shows you understand what the library does.

## Requirements

`createTranslator({ locale, catalogs, fallbackLocale = 'en', onMissing })` returns `t(key, params?)`.

1. **`localeChain(locale, fallbackLocale)`**: the lookup order, without duplicates: `de-AT` → `['de-AT', 'de', 'en']`.
2. **Lookup:** find `key` in the first catalog along the chain that has it.
3. **Plurals:** a message can be an object with one string per CLDR plural category (`zero`, `one`, `two`, `few`, `many`, `other`).
   Choose with `new Intl.PluralRules(locale).select(params.count)`, falling back to `other` if that category is missing.
   An exact `'=0'` entry, if present, wins when `count` is 0 (for "Your inventory is empty").
4. **Use the plural rules of the language the message was *found* in.** If a Polish lookup falls back to English, use English rules.
5. **Interpolation:** replace `{name}` with `params.name`. **Numbers are formatted for the locale** (`1,234` / `1.234`). Leave unknown placeholders as they are.
   Insert values as plain text, never HTML.
6. **Missing everywhere:** call `onMissing(key, locale)` and return the key itself (an obvious, non-crashing placeholder).

(Arabic note: plain `ar` formats with Western digits (`3`) in current browsers. Regional variants like `ar-EG` use Arabic-Indic digits (`٣`).)

## Run the tests

```bash
npx vitest src/module-09-i18n/02-translator
```

## Be ready to answer out loud

- Why is `'You have ' + count + ' ' + (count === 1 ? 'item' : 'items')` wrong, even in English-only code? (Word order differs between languages,
  translators can't see the whole sentence, and the plural logic is English-only.)
- What's **ICU MessageFormat**? (`{count, plural, =0 {Empty} one {# item} other {# items}}`: the standard syntax for plurals, `select` (gender), and
  nesting. It's what FormatJS / `react-intl` use, and what translation tools understand.)
- How do you give translators **context**? (Descriptions on each message, screenshots, and never reusing one key for two meanings: "Open" a chest vs. "Open" a realm.)
- What's **pseudo-localization**, and how does it catch bugs? (Replace strings with accented, ~30% longer versions like `[Ŵéļçöɱé ƀåçķ!!!]` in a test build.
  It reveals hard-coded strings, text that gets cut off, and concatenation.)
- How would you load catalogs without shipping every language to every player? (One JSON file per locale, `import()`ed on demand, as in 7.3.)
