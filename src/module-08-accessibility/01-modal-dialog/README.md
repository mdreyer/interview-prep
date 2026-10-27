# 8.1 An Accessible Confirm-Purchase Dialog

**Difficulty:** Advanced · **Suggested time:** 40 minutes
**Skills:** the WAI-ARIA dialog pattern, focus management (in, trapped, and back out), keyboard handling, `aria-labelledby` / `aria-describedby`

## The ticket

> Before spending Minecoins we show a "Confirm purchase" popup. Keyboard users can Tab right out of it into the page
> behind, screen readers don't announce it, and after closing it focus jumps to the top of the page. Make it a real modal dialog.

You'll edit `ConfirmPurchase.tsx`. Build the behavior yourself: no dialog library, and no native `<dialog>` this time
(you'll discuss that option out loud).

## Requirements

1. The trigger button reads `Buy {bundleName}` and has `aria-haspopup="dialog"`.
2. The dialog has `role="dialog"` and `aria-modal="true"`. Its accessible name comes from its `<h2>Confirm purchase</h2>` (via
   `aria-labelledby`), and its description from the `Buy {bundleName} for {price}?` paragraph (via `aria-describedby`).
3. Inside, in this order: the heading, the description, a `Terms of sale` link (`href="/terms-of-sale"`), then `Cancel` and `Buy now` buttons.
4. **Focus in:** when it opens, focus moves to **`Cancel`**. (For anything that spends money or destroys data, start on the safe choice.)
5. **Focus trapped:** `Tab` from the last focusable element wraps to the first, and `Shift+Tab` from the first wraps to the last.
   In between, let the browser move focus normally.
6. **Escape** closes it.
7. **Focus out:** however it closes (`Escape`, `Cancel`, or `Buy now`), focus goes back to **the element that had focus before it opened** (the trigger).
8. `Buy now` calls `onConfirm` once, then closes. `Cancel` and `Escape` never call it.

<details><summary>Hint: where to restore focus</summary>An effect in the dialog component can remember <code>document.activeElement</code> when it mounts, and its cleanup runs when it unmounts. That works for every way of closing, and it keeps working under StrictMode's mount → unmount → mount.</details>

## Run the tests

```bash
npx vitest src/module-08-accessibility/01-modal-dialog
```

## Be ready to answer out loud

- What does `aria-modal="true"` do, and what does it **not** do? (It tells assistive tech to ignore the rest of the page. It doesn't stop
  the mouse, scrolling, or Tab. That's why you need the trap, and ideally `inert` on the background.)
- The native `<dialog>` element with `showModal()` gives you a trap, `Escape`, a backdrop, top-layer stacking and an inert background
  for free. Why might you still see custom dialogs? (Older browser support, design systems, animation, and jsdom didn't support it for a long time.)
  Which would you pick today?
- What should happen to page scrolling behind the dialog?
- When is a dialog the wrong pattern? (Non-blocking info: use a toast with `role="status"`, or an inline message.)
- How would you test this with a real screen reader? (VoiceOver: Cmd+F5 on macOS. NVDA on Windows. Check the name and description are read on open.)
