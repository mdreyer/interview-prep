# Module 8 Quick-Fire (about 15 minutes, out loud)

**1. What's the "first rule of ARIA"?**
<details><summary>Answer</summary>

If a native HTML element or attribute already has the semantics and behavior you need, use it instead of adding ARIA. A `<button>` gives
you the role, focusability, Enter **and** Space activation, and disabled behavior. `<div role="button">` gives you only the role; the rest
you'd have to build. ARIA changes what assistive tech is *told*. It never adds behavior.
</details>

**2. How is an element's accessible name computed, in priority order?**
<details><summary>Answer</summary>

`aria-labelledby` → `aria-label` → native labelling (`<label>`, `alt`, `<legend>`, `<caption>`) → its text content (for roles that allow
name-from-content, like buttons and links) → `title` (last resort) → nothing. Placeholder text is used only as a fallback by some browsers, and is not a label.
</details>

**3. `aria-hidden="true"` vs. `hidden` vs. `display: none` vs. a visually-hidden class?**
<details><summary>Answer</summary>

`hidden` / `display: none`: hidden from **everyone**. `aria-hidden="true"`: still visible, but hidden from **assistive tech** (decorative
icons). Never put it on something focusable. Visually-hidden CSS (clip + 1px): hidden **visually**, still read by screen readers (extra
context like "Wishlist *Creeper Hoodie*").
</details>

**4. What does WCAG 2.2 add that frontend engineers notice?**
<details><summary>Answer</summary>

Focus Not Obscured (2.4.11: sticky headers mustn't cover the focused element), Target Size Minimum (2.5.8: 24×24 CSS px), Dragging
Movements (2.5.7: a non-drag alternative), Consistent Help, Redundant Entry, and Accessible Authentication (3.3.8: no cognitive tests
like "type these characters" without an alternative; allow paste and password managers).
</details>

**5. How do you hide content visually but keep it for screen readers, and when should you?**
<details><summary>Answer</summary>

A `.visually-hidden` class: `position: absolute; width: 1px; height: 1px; overflow: hidden; clip: rect(0 0 0 0); white-space: nowrap;`.
Use it to add context that's obvious visually but not from the text alone ("Delete" → "Delete Creeper Hoodie"), for skip links (shown on focus),
and for live regions. Don't use it to stuff keywords in, and keep visible labels inside the accessible name (Label in Name, 2.5.3).
</details>

**6. What's a skip link, and why does a site like Minecraft.net need one?**
<details><summary>Answer</summary>

The first focusable element on the page, "Skip to main content", linking to `#main`. It's visually hidden until focused. A big global
navigation means keyboard users would otherwise tab through dozens of links on every page. Landmarks (`<header>`, `<nav>`, `<main>`, `<footer>`)
give screen-reader users the same shortcut.
</details>

**7. `prefers-reduced-motion`: what is it and what do you do with it?**
<details><summary>Answer</summary>

A media query reflecting the OS setting to reduce motion (vestibular disorders, migraines). Turn off parallax, autoplaying video and large
animated transitions under `@media (prefers-reduced-motion: reduce)`, or swap them for fades. In JS: `matchMedia('(prefers-reduced-motion: reduce)')`,
which is another external store for `useSyncExternalStore`. Related: `prefers-color-scheme`, `prefers-contrast`, `forced-colors`.
</details>

**8. In a single-page app, what accessibility problem do client-side route changes create, and how do you fix it?**
<details><summary>Answer</summary>

The browser no longer announces a new page or resets focus, so a screen-reader user clicks a link and hears nothing, with focus left on a
link that may have disappeared. Fix: update `document.title`, then move focus to the new page's `<h1>` (with `tabIndex={-1}`), or announce
"Navigated to Profile" in a live region. Same idea as 4.2's step headings.
</details>

**9. Which screen reader + browser pairs would you test with?**
<details><summary>Answer</summary>

NVDA + Chrome or Firefox (Windows, free and very common), JAWS + Chrome (Windows, enterprise), VoiceOver + Safari (macOS and iOS),
TalkBack + Chrome (Android). For Minecraft's audience, also think about game consoles' browsers and Narrator on Xbox / Windows.
</details>

**10. Is `outline: none` ever OK?**
<details><summary>Answer</summary>

Only if you replace it with a visible focus style at least as clear, ideally using `:focus-visible` so mouse users don't see rings on click
while keyboard users always do. Removing focus outlines entirely fails WCAG 2.4.7 (Focus Visible), and it's one of the most common audit findings.
</details>
