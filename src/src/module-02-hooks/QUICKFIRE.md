# Module 2 Quick-Fire (about 15 minutes, out loud)

Answer each in 30–60 seconds **before** opening the answer.

---

## JavaScript and browser fundamentals

**1. What's the difference between these two, if `load()` rejects?**

```js
async function a() { try { return load(); } catch { return 'fallback'; } }
async function b() { try { return await load(); } catch { return 'fallback'; } }
```

<details><summary>Answer</summary>

`a()` returns the promise *without awaiting it* inside the `try`, so the rejection happens after the function has
already left the `try` block. The `catch` never runs, and `a()` rejects. `b()` awaits inside the `try`, so the
rejection is caught and it resolves to `'fallback'`. Rule: inside `try`, use `return await`.
</details>

**2. `Promise.all` vs. `Promise.allSettled` vs. `Promise.race` vs. `Promise.any`?**

<details><summary>Answer</summary>

- `all`: resolves with every value, or rejects on the **first** rejection (fail-fast).
- `allSettled`: waits for every promise and gives you `{status, value | reason}` for each, and it never rejects.
- `race`: settles with whichever promise settles first, whether it resolved or rejected.
- `any`: resolves with the first **success**, and rejects (with an `AggregateError`) only if all of them fail.

Example: loading profile + balance + entitlements for the profile page. Use `all` if any failure should show an error page,
and `allSettled` if each widget can fail on its own.
</details>

**3. What does `AbortController` actually do, and what does the server see?**

<details><summary>Answer</summary>

`controller.abort()` sets `signal.aborted`, fires `abort` on the signal, and makes `fetch` reject with an `AbortError`.
The browser closes the connection. The server *may* notice (ASP.NET Core exposes this as `HttpContext.RequestAborted`,
a `CancellationToken`), but only if the C# code checks it. Otherwise the work keeps going. So for anything that
isn't idempotent, like a purchase, aborting on the client doesn't undo anything on the server. (Module 5 covers this.)
</details>

**4. Debounce vs. throttle, each in one sentence, with a Minecraft.net example.**

<details><summary>Answer</summary>

**Debounce:** run once, after things go quiet for N ms (search as you type, auto-saving a profile field).
**Throttle:** run at most once every N ms while things keep happening (scroll-position tracking, a resize
handler, analytics on a "Buy" button someone is hammering).
</details>

**5. What's a closure, and how does it cause "stale state" in React?**

<details><summary>Answer</summary>

A function captures the variables in scope **when it was created**. Each render creates new functions that capture
*that render's* props and state. An interval or listener created once (in an effect with `[]`) keeps calling the
**first render's** function forever, so it sees the first render's state. Fixes: use a functional updater
(`setX(x => x + 1)`), list the right dependencies, or use a ref or `useEffectEvent` for "latest value" reads.
</details>

---

## React hooks

**6. When exactly does an effect's cleanup run?**

<details><summary>Answer</summary>

(1) **Before the effect runs again** because a dependency changed (the old cleanup runs with the *old* values),
and (2) **on unmount**. In development StrictMode it also runs once right after mount (mount → cleanup → mount)
to check that cleanup works.
</details>

**7. `useEffect` vs. `useLayoutEffect`: when do you need the second?**

<details><summary>Answer</summary>

`useEffect` runs **after the browser paints**. `useLayoutEffect` runs after the DOM updates but **before paint**,
and blocks it. Use the layout version only when you must measure the DOM and change something before the
user sees it (positioning a tooltip, avoiding a flicker). Everything else, use `useEffect`.
</details>

**8. How does React compare dependency array values?**

<details><summary>Answer</summary>

`Object.is`, item by item. A primitive with the same value is "unchanged." An object, array, or function created during
render is a **new reference every render**, so an effect depending on it runs every render. Fixes: depend on
primitives (`user.id`, not `user`), move the object inside the effect, or memoize it.
</details>

**9. `useRef` vs. `useState`: when do you use a ref?**

<details><summary>Answer</summary>

Use a ref for a mutable value that **must not trigger a re-render** when it changes: DOM nodes, timer ids, the "latest
callback," a previous value, an id counter (1.4!). Rule: if the UI shows it, it's state. Also, don't read or
write `ref.current` during render (except to initialize it lazily), because that makes render impure.
</details>

**10. "You might not need an effect": give three things people wrongly do in effects.**

<details><summary>Answer</summary>

(1) **Calculating values** from props or state (filtering, formatting): calculate them during render instead. (2) **Resetting state when a prop
changes**: use a `key`. (3) **Reacting to a user event** (sending a request after a click): do it in the event
handler. Effects are for **synchronizing with external systems**: network, timers, subscriptions, the DOM.
</details>

**11. Why is fetching inside `useEffect` considered low-level in 2026, and what do teams use instead?**

<details><summary>Answer</summary>

Fetching in effects by hand means handling races, caching, deduplication, retries, refetch-on-focus, and loading or
error states yourself. That's exactly what 2.1–2.4 make you do. Production apps usually use **TanStack
Query** (or SWR, RTK Query), or framework data loading (Next.js / Remix loaders, Server Components), or
React 19's `use()` with Suspense. Knowing how to do it by hand is what makes you good at choosing and
debugging those tools.
</details>

**12. What makes something a "custom hook," and what are the rules?**

<details><summary>Answer</summary>

A function whose name starts with `use` and which calls other hooks. Rules: call hooks only at the top level
(not in conditions or loops) and only from components or other hooks. Each component that calls a custom hook gets
its **own** state. Hooks share *logic*, not *state*. To share state, lift it up, or use context or an external store
(`useSyncExternalStore`, as in 2.3).
</details>
