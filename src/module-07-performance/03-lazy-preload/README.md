# 7.3 Code-Splitting: a Lazy Checkout with Preload and Retry

**Difficulty:** Advanced · **Suggested time:** 35 minutes
**Skills:** `React.lazy`, `Suspense`, dynamic `import()`, preloading on intent, recovering from chunk-load failures

## The ticket

> The checkout dialog (payment SDK, address forms, validation) is 40% of the Minecraft.net bundle, but most visitors
> never open it. Split it out. Then fix the two complaints that come with lazy loading: "the button feels slow
> the first time", and "after a deploy, checkout won't open until I refresh."

You'll edit `CheckoutLauncher.tsx`. In the app, `loadCheckoutDialog` would be `() => import('./CheckoutDialog')`.
Here it's injected so the tests control when the "download" finishes or fails. `ErrorBoundary.tsx` is given.

## Requirements

1. **`lazyWithPreload(loader)`** returns a `React.lazy` component with an extra `.preload()` method.
   `preload()` and React's own first render must share **one** download: calling `preload()` any number of times calls `loader` once.
2. **`CheckoutLauncher`** renders a `Buy Minecoins` button. Nothing is downloaded on mount.
3. **Preload on intent:** start the download when the pointer enters the button, **or** when it gets keyboard focus.
   (By the time the click lands, the chunk is often already there.)
4. Clicking opens the dialog: render the lazy component (pass it `onClose`) inside
   `<Suspense fallback={<p role="status">Loading checkout…</p>}>`. `onClose` closes it. Reopening must not download again.
5. **Create the lazy component once per launcher**, not during render. Re-rendering `CheckoutLauncher` must not remount an open
   dialog (the tests type into it, re-render, and check the text is still there).
6. **Chunk-load failure:** wrap it in the `ErrorBoundary`, with the fallback `role="alert"` containing `Checkout couldn't load.` and
   a `Try again` button. `Try again` must **download again** and then show the dialog.
   <details><summary>Hint</summary><code>React.lazy</code> caches the result of its loader, including a <em>rejection</em>, forever. Resetting the boundary alone re-renders the same lazy component, which throws the same cached error. What do you need a brand-new one of?</details>

## Run the tests

```bash
npx vitest src/module-07-performance/03-lazy-preload
```

## Be ready to answer out loud

- Why does a chunk fail to load "after a deploy"? (The old `index.html` or JS points at a hashed chunk the new deploy deleted.)
  What can the *server* side do about it? (Keep old chunks around for a while, or reload once on `ChunkLoadError`.)
- Route-level vs. component-level splitting: what would you split first on Minecraft.net?
- What else can you do at hover time? (`<link rel="prefetch">` or `preload`, prefetch the *data* too, warm up the payment SDK.)
- How do you find out what's in the bundle? (`vite build` + `rollup-plugin-visualizer`, source-map-explorer, Lighthouse "Reduce unused JavaScript".)
- Name the Core Web Vitals and what each measures. Which one does a giant JS bundle hurt most? (LCP: loading. **INP**: responsiveness,
  which replaced FID in 2024. CLS: layout shift. A big bundle hurts LCP and INP, because of the long main-thread tasks parsing and running it.)
