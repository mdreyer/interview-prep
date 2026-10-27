# 8.2 Server Search (the ARIA Combobox Pattern)

**Difficulty:** Advanced · **Suggested time:** 45 minutes
**Skills:** `role="combobox"` + `role="listbox"`, `aria-activedescendant`, `aria-expanded` / `aria-controls`, keyboard interaction, live-region announcements

## The ticket

> The "Add a server" box suggests servers as you type, but the suggestions are plain `<div>`s you can only click.
> Keyboard and screen-reader users can't reach them at all. Rebuild it to the WAI-ARIA combobox pattern.

You'll edit `ServerSearch.tsx`. The pattern is the ARIA Authoring Practices Guide's **"Editable Combobox With List Autocomplete"**.
It's one of the most-asked accessibility interview builds, because it combines focus, ARIA state and keyboard handling.

## Requirements

**Structure**
1. An `<input role="combobox">` labelled `Server`, with `aria-autocomplete="list"`, `aria-controls` pointing at the listbox's `id`,
   and `aria-expanded` saying whether the list is showing.
2. A `role="listbox"` labelled `Servers`, with one `role="option"` per match. Hide it (or don't render it) when collapsed.
3. **Focus never leaves the input.** The "current" option is shown with `aria-activedescendant` on the input (the active option's
   `id`), and `aria-selected="true"` on that one option only.

**Behavior**
4. Typing filters `servers` (case-insensitive "contains"), and expands the list if anything matches. Typing doesn't activate an option.
5. `ArrowDown`: if collapsed, expand and activate the **first** option; otherwise move to the next one, wrapping to the first.
   `ArrowUp`: the same in reverse (collapsed → activate the **last**). Both should `preventDefault()` (they'd move the text cursor otherwise).
6. `Enter` with an active option: put its text in the input, collapse, and call `onSelect(server)`. With no active option, do nothing.
7. Clicking an option does the same as `Enter`.
8. `Escape`: if expanded, collapse and keep the text; if already collapsed, clear the text.
9. **Announce results** in a `role="status"` region (it can be visually hidden): `4 servers found`, `1 server found`, or `No servers found`.
   Empty when the input is empty. When nothing matches, the list collapses.

## Run the tests

```bash
npx vitest src/module-08-accessibility/02-combobox
```

## Be ready to answer out loud

- Why `aria-activedescendant` instead of actually moving focus to each option? What would break if focus moved?
- What's the difference between `aria-selected` on an option here and a checkbox's `checked`?
- Clicking an option makes the input lose focus before the `click` fires. How did you (or would you) handle that? (`onMouseDown` + `preventDefault`.)
- With 5,000 servers, what changes? (Debounce the filter or the request (2.2), limit how many options you show, maybe virtualize (7.2),
  and keep the active option scrolled into view with `scrollIntoView({ block: 'nearest' })`.)
- When would you just use a native `<input list>` + `<datalist>` instead? (Simple cases. You give up styling and control, and
  screen-reader support has historically been uneven.)
