# 8.4 Bug Hunt: Realm Settings

**Difficulty:** Intermediate · **Suggested time:** 30 minutes
**Skills:** spotting accessibility bugs in a code review, semantic HTML first, WCAG basics

## The ticket

> An accessibility audit of the Realms settings panel came back with a page of findings. It looks fine with a mouse and a monitor.

You'll edit `RealmSettings.tsx`. Like 1.4, 2.4 and 7.1, it's a bug hunt. **Before running the tests**, read the component
and write down every problem you can find, as if you were reviewing a pull request. There are about ten.
Then run the tests and see what you missed.

**Rule of thumb for every fix:** reach for the native HTML element first (`<button>`, `<label>`, `<input type="checkbox">`, `<form>`).
Add ARIA only when no element does the job. ("No ARIA is better than bad ARIA.")

## What the tests check (spoilers: try your own review first)

<details><summary>Open the list</summary>

1. The icon-only close button has an accessible name (`Close`).
2. The thumbnail has alt text: `{realm name} thumbnail`.
3. Headings don't skip levels: `h1` Realm settings → `h2` General.
4. The name field has a real, visible `<label>` (`Realm name`). A placeholder isn't a label.
5. Nothing has a positive `tabIndex`.
6. `Allow cheats` is a real toggle: a checkbox (or `role="switch"`), focusable, with a checked state.
7. `Save settings` is a real button that works with the keyboard.
8. An empty name shows the text `Enter a realm name.`, connected to the field (`aria-invalid` + `aria-describedby`), not only a red border.
9. `Settings saved` is announced by a `role="status"` region that's **already in the page** before the save. (Live regions that appear
   at the same moment as their text are often not read out.)
</details>

## Run the tests

```bash
npx vitest src/module-08-accessibility/04-a11y-bug-hunt
```

## Be ready to answer out loud

- What are the four WCAG principles (POUR), and which level do most companies target? (Perceivable, Operable, Understandable, Robust. Level AA.)
- What are the contrast requirements? (4.5:1 for normal text, 3:1 for large text and for UI components and focus indicators.)
- `role="status"` vs. `role="alert"` vs. `aria-live="assertive"`: when do you use each?
- How would you catch these automatically? (eslint-plugin-jsx-a11y in the editor, axe-core in unit tests (`vitest-axe`) and in
  Playwright, Lighthouse in CI.) What share of issues can automation catch? (Roughly a third. You still need keyboard and screen-reader testing.)
- Who benefits from these fixes besides screen-reader users? (Keyboard and switch users, voice-control users ("click Save settings"
  only works if that's the button's name), people zoomed to 400%, and everyone on a phone in the sun.)
