# 8.3 Inventory Grid (Roving Tabindex)

**Difficulty:** Intermediate+ · **Suggested time:** 35 minutes
**Skills:** `role="grid"`, roving `tabIndex`, arrow-key navigation, managing focus with refs, one tab stop per widget

## The ticket

> The web inventory viewer (for the Realms backup browser) has 27 slots, and keyboard users have to press Tab 27 times to get past it.
> Make the whole grid **one** tab stop, with arrow keys inside it, like the game's own controller navigation.

You'll edit `InventoryGrid.tsx`.

## Requirements

1. A `role="grid"` labelled `Inventory`, containing `role="row"`s of `columns` (default 9) `role="gridcell"`s each.
   A cell shows `{name} ({count})`, or `Empty slot`.
2. **One tab stop.** Exactly one cell has `tabIndex={0}`. Every other cell has `tabIndex={-1}`. At first it's the first cell.
3. **Arrow keys move focus** (actually call `.focus()`) and move the tab stop with it:
   - `ArrowRight` / `ArrowLeft`: along the row, **stopping** at the row's edges (no wrapping to the next row)
   - `ArrowDown` / `ArrowUp`: same column, next or previous row, stopping at the top and bottom
   - `Home` / `End`: first / last cell of the current row
4. **It remembers.** Tab out of the grid and back in, and you land on the cell you left.
5. `Enter` or `Space` **selects** the focused slot: `aria-selected="true"` on it (and `"false"` on the rest), and call `onSelect(index)`.
   (Prevent Space's default, so the page doesn't scroll.)
6. Clicking a cell focuses it, selects it, and makes it the tab stop.

## Run the tests

```bash
npx vitest src/module-08-accessibility/03-inventory-grid
```

## Be ready to answer out loud

- Roving `tabIndex` vs. `aria-activedescendant` (8.2): when would you choose each?
- Which other widgets use roving tabindex? (Tabs, toolbars, radio groups (natively!), menus, tree views.) Now finish 6.4's tabs:
  how would arrow keys work there? (Left/Right move between tabs; "automatic" activation selects on focus, "manual" waits for Enter.)
- Should a grid be a `<table>`? When is `role="grid"` the wrong choice? (A static table of data should be a plain `<table>`. `grid` is for
  **interactive** two-dimensional widgets, and it changes how screen readers behave inside it.)
- How do you make sure focus is *visible*? (`:focus-visible` styles, and never `outline: none` without a replacement. WCAG 2.4.7 and 2.4.11.)
- Should every cell say "Empty slot"? Think about what a screen reader user hears moving through 20 empty slots.
