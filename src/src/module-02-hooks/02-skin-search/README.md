# 2.2 Skin Search (debounce + race conditions)

**Difficulty:** Intermediate+ · **Suggested time:** 35 minutes
**Skills:** writing a custom hook, debouncing, `AbortController`, out-of-order responses, async UI states

## The ticket

> The Marketplace page on Minecraft.net needs a search-as-you-type box for skins. Search should
> feel instant, but we can't hit the API on every keystroke, and results from an old query must
> never replace results from a newer one.

You'll edit `SkinSearch.tsx`, which contains **two** things to build:

1. `useDebouncedValue(value, delayMs)`, a reusable custom hook
2. the `SkinSearch` component that uses it

`searchSkins(query, signal)` is passed in as a prop. Pass the `AbortSignal` along, as `fetch` would accept it.

## Requirements

### `useDebouncedValue(value, delayMs)`
- Returns `value` immediately on the first render.
- When `value` changes, returns the new value only after it has stayed the same for `delayMs`.
  Each new change restarts the wait.
- Clears its timer on unmount.

### `SkinSearch`
1. An `<input type="search">` labelled `Search skins`.
2. **Debounce** the query by `debounceMs` (default 300), so typing `creeper` quickly makes **one**
   request, for `creeper`. Trim the query, and never search for an empty one.
3. **One status line.** Show exactly one message, in an element with `role="status"`:

   | State | Text |
   |---|---|
   | empty query | `Type to search skins.` |
   | request in flight | `Searching…` (a single `…` character) |
   | results | `3 skins found` / `1 skin found` |
   | zero results | `No skins found for "{query}".` |
   | request failed | `Something went wrong.` |

4. **Results** go in a `<ul aria-label="Search results">`, one `<li>` per skin, with the text `{name} by {creator}`.
   Show the list only when there are results.
5. **Errors:** when a request fails, also show a `Try again` button that re-runs the current query.
6. **Cancellation:** when the query changes, or the component unmounts, while a request is in flight,
   **abort** that request with its `AbortSignal`. An aborted request must not show an error.
7. **No stale results:** results or errors for an old query must never be displayed.

## Constraints

- Plain React (no data-fetching libraries). `useDebouncedValue` must be a general-purpose hook (it
  shouldn't know anything about skins).
- Avoid storing anything you can calculate. (Is `isLoading` a separate piece of state, or can you calculate it?)

## Run the tests

```bash
npx vitest src/module-02-hooks/02-skin-search
```

## Be ready to answer out loud

- Debounce vs. throttle: define each, and give a Minecraft.net example where you'd use throttle instead.
- Aborting vs. an `ignore` flag: what does each protect against? Why might you want both?
- What does the C# API see when you abort? (Does the server stop working on the request?)
- How would TanStack Query (React Query) change this component? What would you delete?
