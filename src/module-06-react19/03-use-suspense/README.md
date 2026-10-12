# 6.3 Player Profile (`use` + Suspense + an Error Boundary)

**Difficulty:** Advanced · **Suggested time:** 40 minutes
**Skills:** `use(promise)`, `<Suspense>`, writing an error boundary, caching promises, resetting a boundary with `key`

## The ticket

> The player profile page is a tangle of `isLoading` / `error` / `data` state and effects. Rewrite it so the component
> just *reads* the profile, and the loading and error states are handled by boundaries around it.

You'll edit `ProfilePage.tsx`.

## Requirements

1. **`ErrorBoundary`** (it has to be a class: React 19 still has no hook for this). Props: `fallback` and `children`.
   When a child throws while rendering, show `fallback`.
2. **A child component** reads the profile with **`use(profilePromise)`** and renders
   `<h2>{username}</h2>` and `<p>{achievements} achievements</p>`. No `useEffect`, no loading state of its own.
3. `ProfilePage` wraps it: an `ErrorBoundary`, then `<Suspense fallback={<p role="status">Loading profile…</p>}>`.
4. **Cache the promises.** `fetchProfile` is called **once per username**:
   - re-rendering with the same `username` must not fetch again (a new promise on every render would suspend forever: why?)
   - switching back to a player you've already loaded shows them **immediately**: no request, no spinner.
   <details><summary>Hint</summary>A <code>Map</code> from username to promise. Where does it live so that it survives re-renders, and survives the children suspending? (Not in a component <em>below</em> the Suspense boundary.)</details>
5. **On failure:** the boundary shows `role="alert"` with `Couldn't load {username}'s profile.` and a `Try again` button.
   `Try again` must fetch again and recover.
   <details><summary>Hint</summary>Two things have to happen: the failed promise must leave the cache, and the boundary must forget its error. A <code>key</code> resets a component. What else has to re-render to hand the boundary a <em>new</em> promise?</details>
6. An error for one player must not stick when you switch to another.

## Run the tests

```bash
npx vitest src/module-06-react19/03-use-suspense
```

## Be ready to answer out loud

- Why must the promise be created **outside** the component that calls `use`? What does React do when a component suspends on its first render?
- `use` can be called inside an `if`, unlike every other hook. Why is that allowed?
- What does an error boundary **not** catch? (Errors in event handlers, in async code like a `setTimeout`, in the boundary itself, and during SSR.) How do you report those?
- In a real app, who owns this cache? (A data library: TanStack Query's `useSuspenseQuery`, or the router's loaders, or
  Server Components passing promises down.) What does it handle that your `Map` doesn't? (Invalidation, expiry, memory.)
- Where would you put Suspense boundaries on a real profile page: one around everything, or one per section? What's the trade-off?
