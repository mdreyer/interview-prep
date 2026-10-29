# 2.4 Bug Hunt: Minecoin Balance (effects edition)

**Difficulty:** Intermediate+ · **Suggested time:** 25 minutes
**Skills:** reading effects critically: dependencies, cleanup, stale closures, races, values calculated in effects

## The ticket

> The Minecoin balance widget in the profile header is misbehaving. Support reports: switching
> accounts shows the wrong balance, the "Updated … ago" text gets stuck, changing the language
> doesn't reformat the number, and our performance team found memory leaks.

`MinecoinBalance.tsx` has **6 bugs**, every one of them in or around an effect. Fix them so all the tests pass.
Same rules as 1.4: **name each bug, explain why it happens, then fix it**, with a `// FIX:` comment for each.

## Intended behavior

1. Fetches the balance for `userId` on mount, and again whenever `userId` changes.
   It never shows a balance that belongs to a previous `userId`.
2. Shows `Loading balance…` until the first balance arrives, then `Balance: {formatted} Minecoins`, formatted
   with `Intl.NumberFormat(locale)`. It reformats right away when `locale` changes.
3. Refreshes the balance whenever the browser window regains focus (`window` `focus` event).
   After unmounting, it stops listening.
4. Shows `Updated {n}s ago`, counting up by one every `tickMs` and resetting to 0 when a new balance arrives.
   After unmounting, no timers are left running.

## Rules

- Keep the overall approach (effects + local state). You may add, remove, merge or rewrite effects.
- Don't touch the tests.

## Run the tests

```bash
npx vitest src/module-02-hooks/04-bug-hunt-balance
```

## Be ready to answer out loud

- One of these bugs is "you might not need an effect." Which one, and what's the rule of thumb?
- If a parent passed `fetchBalance={(id) => api.getBalance(id)}` (a new function every render), what would
  your fixed component do? Name two ways to fix that: one in the parent, one in this component.
- Why does React 18+ StrictMode run effects twice in development, and which of these bugs would it have exposed?
