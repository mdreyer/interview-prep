# Module 6: Modern React 19 (about 2.5 hours)

| # | Problem | Level | Time | Tests |
|---|---|---|---|---|
| — | [Quick-fire Q&A](./QUICKFIRE.md) | — | 15 min | (out loud) |
| 6.1 | [Redeem a Code (`useActionState` + `useFormStatus`)](./01-redeem-code/README.md) | Intermediate+ | 35 min | 8 |
| 6.2 | [Realm Chat (`useOptimistic`)](./02-realm-chat/README.md) | Advanced | 40 min | 8 |
| 6.3 | [Player Profile (`use` + Suspense + an error boundary)](./03-use-suspense/README.md) | Advanced | 40 min | 6 |
| 6.4 | [Profile Tabs (`useTransition` + Suspense)](./04-transitions/README.md) | Intermediate+ | 25 min | 5 |

```bash
npx vitest src/module-06-react19
```

**The thread through this module:** React 19 moves async work *into* React. Instead of you tracking `isLoading`,
`error` and "which request is the latest" in effects and state, you hand React a promise or an async function
(an **action**) and it tracks pending, ordering, and fallbacks for you.

| You used to write… | React 19 gives you… | Problem |
|---|---|---|
| `onSubmit` + `preventDefault` + `isPending` state + `try/finally` | `<form action>` + `useActionState` + `useFormStatus` | 6.1 |
| Optimistic state + rollback by hand (5.4) | `useOptimistic` | 6.2 |
| `useEffect` fetch + `isLoading` / `error` / `data` | `use(promise)` + `<Suspense>` + an error boundary | 6.3 |
| "Keep showing the old tab until the new one loads" logic | `startTransition` | 6.4 |

**Know the limits too:** none of this replaces a server-state cache (TanStack Query, or a framework's loaders) for
caching, deduping and invalidation. Interviewers like candidates who can say both what's new and what's still missing.
