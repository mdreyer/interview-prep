# 7.4 A Tiny Store with Selectors (build your own Zustand)

**Difficulty:** Advanced · **Suggested time:** 40 minutes
**Skills:** immutable updates, the observer pattern, `useSyncExternalStore` with selectors, snapshot stability, equality functions

## The ticket

> The Minecoin wallet lives in a Context (like 4.3), and every change, even the theme toggle, re-renders every component
> that reads anything from it. Replace it with a small external store where each component subscribes to **only the slice it uses**.

You'll edit `store.ts`. This is the core of how Zustand, Redux's `useSelector`, and Jotai work, and it's your third
`useSyncExternalStore` (after 2.3's online status and 4.4's URL).

## Requirements

### `createStore(initialState)` → `{ getState, setState, subscribe }`
1. `setState(partial)` or `setState(state => partial)` **merges** into a **new** state object. Never mutate the old one.
2. If every key in the update is `Object.is`-equal to the current value, do nothing: no new object, no notifications.
3. `subscribe(listener)` returns an unsubscribe function. Every listener is called after each real change.
4. The methods must work when pulled off the object (`const { setState } = store`), and `subscribe` must keep the same identity forever. Why does that matter to `useSyncExternalStore`?

### `shallowEqual(a, b)`
5. `true` if they're `Object.is`-equal, or if both are objects or arrays with the same keys and `Object.is`-equal values one level deep.

### `useStore(store, selector, isEqual = Object.is)`
6. Returns `selector(store.getState())`, and re-renders the component **only when the selection changes** according to `isEqual`.
7. **The warning:** `useSyncExternalStore` calls `getSnapshot` often, and requires it to return **the same value** (by `Object.is`)
   while nothing has changed. A selector like `s => ({ balance: s.balance })` returns a **new object every call**. Passed straight in,
   it makes React re-render forever. So:
   - remember the last state and the last selection, and return the old selection when the state hasn't changed
   - when the state *has* changed, compute the new selection, but return the **old** one if `isEqual(old, new)`
8. A selector that depends on props (`s => s.cart.includes(item)`) must pick up a new prop, even if the store didn't change.
9. Unsubscribe on unmount (`useSyncExternalStore` does this for you, if you hand it `store.subscribe`).

## Run the tests

```bash
npx vitest src/module-07-performance/04-store-selectors
```

## Be ready to answer out loud

- Context vs. an external store with selectors: when is Context *still* the right tool? (Values that rarely change, like theme,
  locale or the current user, and dependency injection. A store suits frequently changing state that many components read slices of.)
- Why does `useSyncExternalStore` exist at all? What's **tearing**, and why did concurrent rendering make it possible?
- Why is `shallowEqual` usually enough, and when would you need a deep compare? (Almost never. Select primitives, or select less.)
- In Redux Toolkit, what plays the role of your selector cache? (`createSelector` from Reselect: memoized derived data.)
- Would you put **server data** (the balance from the C# API) in this store? (Usually not: server state belongs in a server-state cache
  like TanStack Query. Client state, like the cart drawer or a draft order, goes in a store like this.)
