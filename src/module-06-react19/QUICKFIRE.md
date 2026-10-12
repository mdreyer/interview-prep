# Module 6 Quick-Fire (about 15 minutes, out loud)

**1. What's an "action" in React 19?**
<details><summary>Answer</summary>

A function that runs inside a **transition**, and may be async. React tracks its pending state, and its state updates
commit together when it finishes. You get one by passing a function to `<form action>`, `<button formAction>`,
`useActionState`, or `startTransition(async () => …)`. Errors thrown in an action go to the nearest error boundary.
</details>

**2. `ref` as a prop: what changed, and what about `forwardRef`?**
<details><summary>Answer</summary>

Function components receive `ref` as a regular prop: `function Input({ ref, ...props }) { return <input ref={ref} {...props} /> }`.
`forwardRef` still works but is no longer needed and will be deprecated. Ref callbacks can also **return a cleanup function** now,
like effects.
</details>

**3. What's new about Context in React 19?**
<details><summary>Answer</summary>

You can render `<ThemeContext value="dark">` directly instead of `<ThemeContext.Provider>`. And `use(ThemeContext)` reads context,
and unlike `useContext`, it can be called conditionally (after an early return, inside an `if`).
</details>

**4. Can you render `<title>` and `<meta>` from a component now?**
<details><summary>Answer</summary>

Yes. React 19 hoists `<title>`, `<meta>` and `<link>` rendered anywhere in the tree into `<head>`. It also handles stylesheet
precedence (`<link rel="stylesheet" precedence="default">`) and lets you preload resources with `preload()` / `preinit()` from `react-dom`.
This replaces `react-helmet` for simple cases.
</details>

**5. What are Server Components, in two sentences? And what's a Server Action?**
<details><summary>Answer</summary>

**Server Components** render only on the server (at build time or per request). They can read databases and files directly,
and send no JavaScript to the client. Client Components (`'use client'`) are the interactive islands inside them.
**Server Actions** (`'use server'`) are async functions the client can call like a local function: the framework turns the call
into a POST. They need a framework (Next.js etc.). In a Vite SPA talking to a C# API, like most of Minecraft.net's SPA areas, you
use client actions instead, as in this module.
</details>

**6. What does the React Compiler do, and what doesn't it do?**
<details><summary>Answer</summary>

An **opt-in build plugin** (Babel/Vite) that automatically memoizes components and values, as if you'd written `memo`,
`useMemo` and `useCallback` everywhere it's safe. It only works if your components follow the Rules of React (pure renders,
no mutating props or state). It doesn't fix slow algorithms, giant lists (virtualize: Module 7), or network waterfalls.
And it's not part of React 19 itself: it's a separate tool you add.
</details>

**7. `useDeferredValue(value)`: what does it do?**
<details><summary>Answer</summary>

It returns a version of `value` that "lags behind" during urgent updates: React first re-renders with the old value
(so the input stays responsive), then renders again in the background with the new one. Pair it with a `memo`'d slow child
that reads the deferred value. Comparing `value !== deferredValue` tells you it's stale (dim the list). In React 19 it accepts
an `initialValue` too.
</details>

**8. What happens when a component suspends?**
<details><summary>Answer</summary>

It throws, conceptually: React stops rendering that subtree and shows the nearest `<Suspense>` fallback. When the promise
settles, it retries the render. If the suspension happens during a **transition** and the content was already showing,
React keeps the old UI instead of the fallback (6.4). State in components that suspend before ever committing is thrown away,
which is why the promise cache must live above the boundary (6.3).
</details>

**9. Name some React 19 breaking changes you'd hit when upgrading from 18.**
<details><summary>Answer</summary>

`propTypes` and `defaultProps` on function components are ignored (use TS and default parameters). String refs and legacy
context are removed. `ReactDOM.render` and `hydrate` are gone (use `createRoot` / `hydrateRoot`). Errors thrown during render are
no longer re-thrown; they're reported through `window.reportError` plus the new `onCaughtError` / `onUncaughtError` root options.
The JSX namespace moved to `React.JSX` in the types. There's a codemod for most of it.
</details>

**10. When would you still use `useEffect` in React 19?**
<details><summary>Answer</summary>

To **synchronize with something outside React**: subscriptions (though `useSyncExternalStore` is usually better), timers, DOM
APIs, analytics, a non-React widget. **Not** for computing values from props or state (calculate during render), not for reacting
to events (do it in the handler), and less and less for fetching (use `use` + a cache, a data library, or the framework).
</details>
