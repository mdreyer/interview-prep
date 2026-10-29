# Module 1 Quick-Fire (about 15 minutes, out loud)

---

## JavaScript and browser fundamentals

**1. What does this log, and what changes if `var` becomes `let`?**

```js
for (var i = 0; i < 3; i++) {
  setTimeout(() => console.log(i));
}
```

<details><summary>Answer</summary>

`3 3 3`. `var` is scoped to the whole function, so all three callbacks close over the **same** `i`, which is `3` by the
time the timers run. With `let`, each loop iteration gets a **new binding**, so it logs `0 1 2`. This is the same
closure behavior behind stale state in React effects (Module 2).
</details>

**2. Put these in the order they log:**

```js
console.log('A');
setTimeout(() => console.log('B'));
Promise.resolve().then(() => console.log('C'));
queueMicrotask(() => console.log('D'));
console.log('E');
```

<details><summary>Answer</summary>

`A E C D B`. The synchronous code runs first. Then the **microtask** queue empties completely (promise callbacks and
`queueMicrotask`, in the order they were queued). Only after that does the next **macrotask** (the timer) run.
Rendering opportunities come between macrotasks, so a microtask loop that never ends will freeze the page.
</details>

**3. What do these evaluate to: `0 || 'x'`, `0 ?? 'x'`, `'' ?? 'x'`, `null ?? 'x'`?**

<details><summary>Answer</summary>

`'x'`, `0`, `''`, `'x'`. `||` falls back on any **falsy** value. `??` falls back only on `null` or `undefined`.
In UI code, `??` is usually what you want: a Minecoin balance of `0` is a real value, not a missing one.
And watch out for `{count && <Badge />}`, which renders a literal `0` when `count` is 0.
</details>

**4. Why is `0.1 + 0.2 !== 0.3`, and how does that affect checkout code?**

<details><summary>Answer</summary>

Numbers are IEEE-754 binary floating point, and 0.1 can't be represented exactly in binary. Keep money in **integer minor
units** (cents), do the math there, and format only for display. Better still, let the server be the source of truth
for prices and totals. On the server side, C# has a `decimal` type made for exactly this.
</details>

**5. Bubbling vs. capturing, and what event delegation is. Where does React attach its listeners?**

<details><summary>Answer</summary>

An event goes **down** through the capture phase (window → target), then back **up** through the bubble phase.
Delegation means putting one listener on an ancestor and checking `event.target`, instead of one listener per child.
Since React 17, React puts its listeners on the **root container** (not `document`), and its synthetic events
follow the same capture and bubble phases (`onClickCapture` / `onClick`).
</details>

**6. `<script>`, `<script defer>`, and `<script async>`: what's the difference?**

<details><summary>Answer</summary>

A plain script **blocks HTML parsing** while it downloads and runs. `defer` downloads in parallel and runs **in document
order after parsing finishes** (before `DOMContentLoaded`). `async` downloads in parallel and runs **as soon as it arrives**,
in no guaranteed order. That makes `async` good for independent scripts like analytics, and `defer` good for app code. ES module scripts are deferred by default.
</details>

**7. Spread vs. `structuredClone`: when does a spread copy bite you?**

<details><summary>Answer</summary>

`{ ...obj }` is a **shallow** copy, so nested objects and arrays are still shared. If you update nested state with
only a top-level spread and then mutate the nested part, you've mutated the previous state too.
`structuredClone` makes a deep copy (but it can't copy functions or DOM nodes). In React, prefer copying
only the path you're changing: `{ ...s, profile: { ...s.profile, name } }`.
</details>

---

## React fundamentals

**8. What makes a component re-render?**

<details><summary>Answer</summary>

(1) Its own state changes. (2) Its **parent re-renders**, even if the props didn't change, unless it's wrapped in `memo` and the props are shallow-equal.
(3) A context it reads changes. A change in props alone never triggers a render; the parent rendering is what does it.
Also, setting state to the **same value** (`Object.is`) is skipped. That's exactly why `push` and then `setState(sameArray)` does nothing.
</details>

**9. Why can't you call hooks inside conditions or loops?**

<details><summary>Answer</summary>

React tracks a component's hooks **by the order they're called** on each render. There are no names, just positions
in a list. If you call one conditionally, the positions shift, and state ends up attached to the wrong hook.
(React 19's `use()` is the exception: it *can* be called conditionally.)
</details>

**10. What does `<StrictMode>` do in development, and why?**

<details><summary>Answer</summary>

It renders components twice, and runs effects set up → clean up → set up again, to flush out **impure renders** and
**missing effect cleanups**. If your effect breaks when it runs twice, it was already broken for real situations like
fast navigation or a remount. None of this happens in production builds.
</details>

**11. `setCount(count + 1)` three times in one click handler: what's the result, and how do you fix it?**

<details><summary>Answer</summary>

It goes up by **1**. All three calls read the same `count` from that render's closure, and React batches the updates.
Use the updater form, `setCount(c => c + 1)`, to get +3. React 18+ batches automatically everywhere:
in timeouts, promises, and native handlers too.
</details>

**12. What does `key` actually do? Give a non-list use.**

<details><summary>Answer</summary>

`key` is part of a component's **identity**. React matches old and new elements by type + key, so the same key
means "same instance, keep its state" and a different key means "throw it away and mount a new one." Outside lists:
`<ProfileForm key={userId} />` resets all of the form's internal state when the user changes,
without any effects. (This answers the last question in 1.2.)
</details>

**13. Controlled vs. uncontrolled inputs. Name a case where uncontrolled is fine.**

<details><summary>Answer</summary>

**Controlled:** React state is the source of truth (`value` + `onChange`). **Uncontrolled:** the DOM keeps the value
(`defaultValue`, read it with a ref or `FormData`). Uncontrolled works well for simple forms that you only read on submit, and
React 19's form **actions** lean that way (`<form action={fn}>` hands you a `FormData`). Never switch an input between
the two: going from `value={undefined}` to a string triggers React's warning.
</details>

**14. In one breath: what's new and notable in React 19?**

<details><summary>Answer</summary>

**Actions** (async transitions, with `useActionState`, `useFormStatus`, `useOptimistic`, and `<form action>`), the `use()` API
for reading promises and context, **`ref` as a regular prop** (no more `forwardRef`), `<Context>` usable directly as a provider,
document metadata (`<title>`, `<meta>`) you can render from any component, and stable Server Components / Server Actions.
The **React Compiler** (automatic memoization) ships separately. Module 6 goes deeper.
</details>
