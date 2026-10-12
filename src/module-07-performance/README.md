# Module 7: Performance (about 2.5 hours)

| # | Problem | Level | Time | Tests |
|---|---|---|---|---|
| — | [Quick-fire Q&A](./QUICKFIRE.md) | — | 15 min | (out loud) |
| 7.1 | [Bug Hunt: the Slow Marketplace Page](./01-rerender-bug-hunt/README.md) | Intermediate+ | 35 min | 7 |
| 7.2 | [A Virtualized List](./02-virtual-list/README.md) | Advanced | 40 min | 9 |
| 7.3 | [Code-Splitting: a Lazy Checkout with Preload and Retry](./03-lazy-preload/README.md) | Advanced | 35 min | 8 |
| 7.4 | [A Tiny Store with Selectors](./04-store-selectors/README.md) | Advanced | 40 min | 13 |

```bash
npx vitest src/module-07-performance
```

**The thread through this module:** *measure, then do less work.* Each problem removes a different kind of waste:

| Waste | Fix | Problem |
|---|---|---|
| Re-rendering components whose output didn't change | move state down, `memo` + stable props, `useMemo` | 7.1 |
| Rendering things nobody can see | virtualization | 7.2 |
| Downloading code nobody uses yet | code-splitting + preloading on intent | 7.3 |
| Waking up every subscriber for every change | selectors with equality checks | 7.4 |

**In an interview, lead with measurement.** "First I'd open the React Profiler and the Performance panel with 4× CPU throttling,
find what's actually slow, then…" beats any list of tricks. Premature `useMemo` everywhere is a yellow flag, and so is
"the React Compiler handles all of it".
