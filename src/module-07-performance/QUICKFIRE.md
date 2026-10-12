# Module 7 Quick-Fire (about 15 minutes, out loud)

**1. Name the Core Web Vitals, with the "good" thresholds.**
<details><summary>Answer</summary>

**LCP** (Largest Contentful Paint, loading): ≤ 2.5 s. **INP** (Interaction to Next Paint, responsiveness; it replaced FID in March 2024):
≤ 200 ms. **CLS** (Cumulative Layout Shift, visual stability): ≤ 0.1. They're measured at the 75th percentile of real users (field data,
e.g. CrUX or the `web-vitals` library), not just in Lighthouse (lab data).
</details>

**2. What's a "long task", and why does it hurt INP?**
<details><summary>Answer</summary>

Any main-thread task over **50 ms**. While it runs, the browser can't respond to input or paint, so a click waits. Fixes: split the work
(`await` a yield such as `scheduler.yield()` or `setTimeout(0)`, chunk loops), move it off the main thread (a Web Worker), do less of it
(memoization, virtualization), or let React interrupt it (transitions).
</details>

**3. `memo`, `useMemo`, `useCallback`: one line each.**
<details><summary>Answer</summary>

`memo(Component)`: skip re-rendering when all props are `Object.is`-equal. `useMemo(fn, deps)`: cache a *computed value* between renders.
`useCallback(fn, deps)`: cache a *function's identity* (it's `useMemo(() => fn, deps)`). The last two mostly matter when the value is
passed to a `memo` child, or used as an effect dependency.
</details>

**4. What causes layout thrashing?**
<details><summary>Answer</summary>

Interleaving DOM **reads** that need layout (`offsetHeight`, `getBoundingClientRect`) with **writes** (style changes) in a loop. Each read
forces the browser to recalculate layout synchronously. Batch all the reads, then all the writes (or use `requestAnimationFrame`).
Animate `transform` and `opacity`: they skip layout and paint, and run on the compositor.
</details>

**5. `defer` vs. `async` vs. `type="module"` vs. `<link rel="preload">` vs. `prefetch`?**
<details><summary>Answer</summary>

`defer`: download in parallel, run in order after parsing. `async`: run as soon as it arrives, in any order. Module scripts are deferred by
default. `preload`: "I need this **for this page**, fetch it now, at high priority" (fonts, the LCP image). `prefetch`: "I'll probably need
this **next**, fetch it when idle, at low priority" (the next route's chunk). `preconnect`: open the connection to another origin early (a CDN, the API).
</details>

**6. How do you make images fast?**
<details><summary>Answer</summary>

Modern formats (AVIF / WebP), `srcset` + `sizes` for the right resolution, `width`/`height` (or `aspect-ratio`) to avoid CLS,
`loading="lazy"` for images below the fold, but **never** for the LCP image, which gets `fetchpriority="high"` instead. Serve them from a CDN.
</details>

**7. What's tree shaking, and what defeats it?**
<details><summary>Answer</summary>

The bundler drops exports nothing imports, using static ES module `import`/`export`. It's defeated by CommonJS (`require`), modules with
side effects at the top level (unless `"sideEffects": false` in package.json says otherwise), and `import * as lib` used dynamically.
`import { debounce } from 'lodash-es'` shakes; `import _ from 'lodash'` pulls in the whole library.
</details>

**8. How does HTTP caching work for a Vite build's assets?**
<details><summary>Answer</summary>

Built JS and CSS files have **content hashes** in their names (`index-3f9a2c.js`), so they can be cached forever:
`Cache-Control: public, max-age=31536000, immutable`. `index.html` must **not** be cached long (`no-cache`, which means "revalidate"),
because it's what points at the new hashes after a deploy. (That's also why old chunks go missing: 7.3.)
</details>

**9. What does the React Profiler tell you?**
<details><summary>Answer</summary>

Per commit: which components rendered, how long each took (self time vs. total), and, with the setting turned on, **why** each one rendered
(props changed, state changed, hooks changed, parent rendered). The flame graph shows where the time goes. "Highlight updates when components
render" makes wasted renders visible as you click around.
</details>

**10. Debounce vs. throttle?**
<details><summary>Answer</summary>

**Debounce:** wait until the calls *stop* for N ms, then run once (search-as-you-type, 2.2). **Throttle:** run at most once every N ms while
the calls keep coming (scroll, resize, mousemove). For anything visual, `requestAnimationFrame` is often the better "throttle", because it
lines up with the display's frames.
</details>
