# 7.2 A Virtualized List ("windowing")

**Difficulty:** Advanced · **Suggested time:** 40 minutes
**Skills:** rendering only what's visible, scroll math, absolute positioning, keeping big lists accessible

## The ticket

> The "All blocks" reference page renders 10,000 rows, and takes four seconds to become interactive on a Chromebook.
> Only about ten rows are ever on screen. Render those, plus a few spare, and fake the rest.

You'll edit `VirtualList.tsx`. Fixed-height rows only (variable heights are the "be ready" question).

## Requirements

1. **`getVisibleRange(count, itemHeight, height, scrollTop, overscan)`** → `{ start, end }` (end exclusive):
   - `start = floor(scrollTop / itemHeight) − overscan`, never below 0
   - `end = ceil((scrollTop + height) / itemHeight) + overscan`, never above `count`
   - **clamp `scrollTop`** to the real maximum (`count × itemHeight − height`, never below 0) first. The browser clamps the
     real scroll position when the content shrinks, but your *state* can be stale for a render.
2. **The viewport:** a `role="list"` element with `aria-label={label}`, an inline style height of `height`px, `overflowY: 'auto'`,
   and `position: 'relative'`. It updates scroll position state from its `onScroll` (read `e.currentTarget.scrollTop`).
3. **The spacer:** the viewport's first child, `items.length × itemHeight` px tall, so the scrollbar looks right.
4. **The rows:** only indexes `start` to `end`, each a `role="listitem"`, absolutely positioned at `top: index × itemHeight`
   (or `transform: translateY(...)`), `itemHeight` tall, with a key from `getKey`.
5. **Accessibility:** each row has `aria-setsize={items.length}` and `aria-posinset={index + 1}`, so a screen reader can still
   say "Block 101, 101 of 10,000" even though most rows don't exist in the DOM. Make the viewport focusable (`tabIndex={0}`) so
   keyboard users can scroll it.
6. `overscan` defaults to 3.

## Run the tests

```bash
npx vitest src/module-07-performance/02-virtual-list
```

(jsdom has no layout engine, so the tests set `scrollTop` themselves and fire a `scroll` event, the same thing the browser does.)

## Be ready to answer out loud

- Why render a few rows of **overscan** above and below? What do you see during a fast scroll without it?
- How would you support **variable-height** rows? (Estimate, measure after render with a `ResizeObserver`, cache the heights,
  and keep a running offset table. That's why people reach for TanStack Virtual or react-window.)
- What breaks with virtualization? (Ctrl+F browser search, "select all", printing, screen readers' list navigation, anchor links,
  and SEO for server-rendered content.) When would you use **pagination** or "Load more" instead?
- Scroll events fire very often. Would you throttle `setScrollTop`? What does `requestAnimationFrame` buy you here?
- What's the CSS alternative? (`content-visibility: auto` with `contain-intrinsic-size`: the browser skips rendering offscreen
  rows but they stay in the DOM. It's cheaper to build, but you save less.)
