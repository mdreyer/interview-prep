# 7.1 Bug Hunt: the Slow Marketplace Page

**Difficulty:** Intermediate+ · **Suggested time:** 35 minutes
**Skills:** why components re-render, `memo`, `useCallback`, `useMemo`, moving state down, referential stability, keys (again)

## The ticket

> On low-end Chromebooks, typing a gift message on the Marketplace page lags a full second behind the keyboard.
> The profiler shows every skin card re-rendering on every keystroke. Also, QA says "Details sometimes opens on
> the wrong skin after searching." Fix both.

You'll edit `MarketplacePage.tsx`. It already works, mostly. Like 1.4 and 2.4, this is a **bug hunt**: read the code,
predict what re-renders and why, then fix it. **Keep the `perf.trackCardRender()` and `perf.trackSort()` calls:**
the tests count them.

## What "fixed" means

1. **Correctness:** an open `Details` panel stays with **its** skin when the list is filtered.
2. Typing in **Gift message** re-renders **zero** skin cards and doesn't re-sort.
3. Toggling **Wishlist** on one skin re-renders **exactly that one** card. (And toggling two different skins in a row must
   still keep both: watch out for stale closures when you stabilize things.)
4. Typing a **search** re-renders **none** of the cards that stay visible, and doesn't re-sort.
5. The sort runs **once** on mount.

Before touching anything, write down every reason a `SkinCard` re-renders right now. There are more than three.
<details><summary>Hint 1: the gift message</summary>Does the page component need to know the gift message at all? Sometimes the best fix needs no memoization: move the state down.</details>
<details><summary>Hint 2: memo isn't enough</summary><code>memo</code> skips a render only when <em>every</em> prop is <code>Object.is</code>-equal to last time. Which props are brand-new objects or functions on every render?</details>
<details><summary>Hint 3: the per-card callback</summary><code>() =&gt; toggleWishlist(skin.id)</code> is a new function for each card on every render, even inside <code>useCallback</code>. What if the card passed its own id back?</details>

## Run the tests

```bash
npx vitest src/module-07-performance/01-rerender-bug-hunt
```

## Be ready to answer out loud

- List the reasons a component re-renders. Which of them does `memo` prevent, and which can't it prevent?
- "Wrap everything in `useMemo` and `useCallback`": why is that not free? When does memoization make things *slower*?
- How would you **find** this in a real app? (React DevTools Profiler: "Highlight updates", "Why did this render?", flame graph. Then measure on a throttled CPU.)
- With the **React Compiler** turned on, which of these fixes would you still need to make by hand? (The key bug. Moving state
  down is still good design. The compiler would handle the memoization.)
- `wishlist.includes(id)` is O(n) per card, so O(n²) per render. When would you switch to a `Set`, and what's the catch with a
  `Set` in React state? (You must create a new `Set` on every change, never mutate it.)
