# 6.4 Profile Tabs (`useTransition` + Suspense)

**Difficulty:** Intermediate+ · **Suggested time:** 25 minutes
**Skills:** `useTransition`, how transitions interact with Suspense, `isPending`, the ARIA tabs pattern (basic version, the keyboard part comes in Module 8)

## The ticket

> On the profile page, clicking a tab blanks the whole section into a spinner, even when the old tab was perfectly
> readable. Keep the current tab on screen until the next one is ready, and show that something is happening.

You'll edit `ProfileTabs.tsx`. Each tab's content arrives as a promise in `resources` (the parent owns the cache this time,
so you can focus on transitions).

## Requirements

1. **Tabs markup:** a `role="tablist"` labelled `Profile sections`, containing one `<button role="tab">` per entry in `TABS`.
   The current tab has `aria-selected="true"` and the others `"false"`. Each tab has an `id` and `aria-controls` pointing at the panel.
2. One `role="tabpanel"` with `aria-labelledby` pointing at the current tab. Inside it:
   `<Suspense fallback={<p>Loading…</p>}>` around a child that renders `<p>{use(resources[tab])}</p>`.
3. Overview is selected first. On that very first load, the fallback (`Loading…`) is fine.
4. **Switching tabs** must keep the **current tab's content visible** while the next tab's promise is pending (no fallback),
   and mark the panel `aria-busy="true"` during that time. When the content arrives, swap it in, move `aria-selected`, and remove `aria-busy`.
5. If the player clicks a second tab while the first is still loading, the last click wins.

Only a few lines separate the broken version from the right one. The point is understanding *why* they work.

## Run the tests

```bash
npx vitest src/module-06-react19/04-transitions
```

## Be ready to answer out loud

- Without the transition, what does React do when the new tab suspends? With it, why does React keep the old UI?
- `isPending` is `true`, but `aria-selected` is still on the **old** tab. Why? Is that a bug, or correct? How could you show
  which tab is *loading*? (Hint: one piece of urgent state for "clicked", plus the transition for "showing".)
- `useTransition` vs. **`useDeferredValue`**: when would you use each? (A search box: the input must update urgently, so you
  defer the *value* the slow list reads. You don't own the state setter there, or it comes from a prop.)
- Transitions aren't debouncing: React still renders every update, it just lets urgent ones interrupt. When would you still debounce? (Network requests: 2.2.)
- What happens to a transition's render if a more urgent update (typing) arrives in the middle of it?
