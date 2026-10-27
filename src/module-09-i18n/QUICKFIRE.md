# Module 9 Quick-Fire (about 15 minutes, out loud)

**1. i18n vs. l10n vs. g11n?**
<details><summary>Answer</summary>

**Internationalization (i18n):** engineering the product so it *can* be adapted (no hard-coded strings or formats, RTL-ready layouts, Unicode
everywhere). **Localization (l10n):** actually adapting it for a locale (translation, local formats, imagery, legal text). **Globalization (g11n):**
both, plus the business side. Engineers mostly own i18n.
</details>

**2. What's a locale identifier, e.g. `zh-Hant-TW` or `en-GB-u-ca-buddhist`?**
<details><summary>Answer</summary>

A BCP 47 tag: language (`zh`), optional script (`Hant` = Traditional Chinese), optional region (`TW`), and optional Unicode extensions after
`-u-` (calendar `ca`, numbering system `nu`, hour cycle `hc`). `Intl.Locale` parses them. Language and region are different things:
`es-MX` and `es-ES` are both Spanish.
</details>

**3. How much longer does translated text get, and what does that mean for UI?**
<details><summary>Answer</summary>

German and Finnish often run 30–40% longer than English, and short labels can double ("Play" → "Spielen"). CJK text is shorter but may need
a larger font size. So: no fixed-width buttons, allow wrapping, and test with pseudo-localization. Never put text in images.
</details>

**4. What goes wrong with `str.length`, `str.toUpperCase()` and `str.split('')` in other languages?**
<details><summary>Answer</summary>

`length` counts UTF-16 code units: emoji and many scripts use 2+ per visible character (`Intl.Segmenter` counts graphemes). Upper/lowercasing
is locale-sensitive: Turkish `i` → `İ` (use `toLocaleUpperCase('tr')`). `split('')` breaks surrogate pairs and combining marks. Also: `é` can be
one code point or two (`e` + combining accent). Normalize with `str.normalize('NFC')` before comparing.
</details>

**5. How do you handle dates and times across time zones?**
<details><summary>Answer</summary>

Store and send **instants** in UTC (ISO 8601 with offset, C#'s `DateTimeOffset`). Convert to the viewer's time zone only for display, with
`Intl.DateTimeFormat`'s `timeZone`. Watch out for "date-only" values like a birthday: they aren't instants, so don't shift them by time zone.
And remember DST: not every day has 24 hours. The `Temporal` API (arriving in browsers now) separates these concepts properly.
</details>

**6. What is ICU MessageFormat, and why do translators prefer it over string concatenation?**
<details><summary>Answer</summary>

A syntax for whole messages with placeholders, plurals and selects:
`{name} has {count, plural, one {# new friend request} other {# new friend requests}}`. The translator sees and reorders the **complete sentence**,
and the plural rules come from CLDR for the target language. Concatenated fragments can't be reordered, and they force English grammar on every language.
</details>

**7. How should the server and client split the i18n work?**
<details><summary>Answer</summary>

The server decides the locale (URL, `Accept-Language`, profile) so SSR and SEO work, sends `<html lang dir>`, and either returns localized
text or (better for APIs) **error codes** that the client maps to its own catalog. The client formats numbers and dates with `Intl`, and
loads only the current locale's messages. C# has `IStringLocalizer` and `RequestLocalizationMiddleware` for the server side.
</details>

**8. What's the difference between `Intl.NumberFormat` `currency` formatting and choosing the currency?**
<details><summary>Answer</summary>

The **locale** decides how a number looks (symbol position, separators, spacing). The **currency** is business data: what the player
actually pays, from their store region. A Swiss German speaker sees `CHF 9.90`; a German in Germany sees `9,90 €`. Never derive currency from language.
</details>

**9. What's RTL "bidi" text, and where does it bite even with `dir="rtl"`?**
<details><summary>Answer</summary>

Mixed-direction text, like an English gamertag inside an Arabic sentence, or a number or URL. The Unicode bidirectional algorithm usually handles
it, but user-generated content can scramble the surrounding punctuation. Wrap it in `<bdi>` (bidirectional isolate), or use `dir="auto"` on inputs
and user content.
</details>

**10. How would you test i18n in CI?**
<details><summary>Answer</summary>

Render key components in several locales (including one RTL and one with complex plurals, like `pl` or `ar`) and assert the formatted output, as in 9.4.
Run a pseudo-locale build and take visual snapshots to catch clipped text. Lint for hard-coded JSX strings. Check that every key exists in every
catalog (missing-key reports, like 9.2's `onMissing`).
</details>
