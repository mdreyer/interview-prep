# Module 2: Hooks in Depth (about 2 hours)

| # | Problem | Level | Time | Tests |
|---|---|---|---|---|
| — | [Quick-fire Q&A](./QUICKFIRE.md) | — | 15 min | (out loud) |
| 2.1 | [Realm Status Poller](./01-realm-status/README.md) | Intermediate | 25 min | 8 |
| 2.2 | [Skin Search (debounce + races)](./02-skin-search/README.md) | Intermediate+ | 35 min | 10 |
| 2.3 | [Offline-Aware Purchase Button](./03-online-status/README.md) | Intermediate | 20 min | 6 |
| 2.4 | [Bug Hunt: Minecoin Balance](./04-bug-hunt-balance/README.md) | Intermediate+ | 25 min | 8 |

Run them all with `npx vitest src/module-02-hooks`, or one at a time by pointing at its folder.

**About these tests:** several use short **real** timers (tens of milliseconds) and `waitFor`, so a test may take
up to a second. If a test times out, it almost always means a timer or request never fired, or never stopped.

`test-utils.ts` has two helpers the tests use: `wait(ms)` and `deferred()`, which creates a promise the test
resolves by hand, to simulate slow or out-of-order responses.

**The thread through this module:** every effect should answer three questions.
1. **What does it synchronize with?** (an interval, a request, an event listener)
2. **What does it depend on?** (every value from render that it reads)
3. **How does it clean up?** (clear, abort, remove, ignore)
