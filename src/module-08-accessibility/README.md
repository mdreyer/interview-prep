# Module 8: Accessibility (about 2.5 hours)

| # | Problem | Level | Time | Tests |
|---|---|---|---|---|
| — | [Quick-fire Q&A](./QUICKFIRE.md) | — | 15 min | (out loud) |
| 8.1 | [An Accessible Confirm-Purchase Dialog](./01-modal-dialog/README.md) | Advanced | 40 min | 8 |
| 8.2 | [Server Search (the ARIA combobox pattern)](./02-combobox/README.md) | Advanced | 45 min | 8 |
| 8.3 | [Inventory Grid (roving tabindex)](./03-inventory-grid/README.md) | Intermediate+ | 35 min | 8 |
| 8.4 | [Bug Hunt: Realm Settings](./04-a11y-bug-hunt/README.md) | Intermediate | 30 min | 8 |

```bash
npx vitest src/module-08-accessibility
```

**The thread through this module:** *semantics, focus, and announcements.* Every accessible widget answers three questions:

| Question | Tools |
|---|---|
| **What is it?** (role, name, state) | native elements first; then `role`, `aria-label` / `aria-labelledby`, `aria-checked` / `aria-selected` / `aria-expanded` |
| **Where is focus, and where does it go next?** | tab order, `tabIndex` 0 / -1, roving tabindex, `aria-activedescendant`, moving and restoring focus |
| **What changed?** | live regions (`role="status"`, `role="alert"`), and moving focus to new content (4.2's headings) |

The [WAI-ARIA Authoring Practices Guide](https://www.w3.org/WAI/ARIA/apg/patterns/) has the keyboard spec for each pattern. In an
interview, saying "I'd follow the APG pattern for a combobox, which says…" is a strong answer.

**Your tests are also accessibility tests.** Every query in this course uses `getByRole(…, { name })`. If a test can find your
element that way, a screen reader can too. That's why Testing Library recommends role queries first.
