# 2.1 Realm Status Poller

**Difficulty:** Intermediate · **Suggested time:** 25 minutes
**Skills:** `useEffect` setup and cleanup, intervals, dependency arrays, ignoring stale async responses

## The ticket

> On the Realms section of a player's profile, show whether each Realm is online and how many
> players are on it. Keep it up to date by checking again every few seconds.

You'll edit `RealmStatus.tsx`. The component receives a `fetchStatus` function as a prop, so the
tests can control exactly when each "request" finishes. In the real app, this would call the C# API.

## Requirements

1. **First check.** Call `fetchStatus(realmId)` as soon as the component mounts. Until the
   first response for the current Realm arrives, show `Checking status…` (that's a single `…` ellipsis character, so copy it from here).
2. **Display.** Put the status text inside an element with `role="status"`:
   - online: `Online: 3 players` (and `Online: 1 player` for exactly one)
   - offline: `Offline`
   - if `fetchStatus` rejects: `Status unavailable`. Keep polling, and the next successful response replaces the message.
3. **Polling.** After the first check, call `fetchStatus` again every `intervalMs` milliseconds (default 15000).
4. **Changing Realms.** When the `realmId` prop changes:
   - go back to `Checking status…`
   - check the new Realm **right away**, then poll it on the same schedule
   - **ignore any response for the old Realm** that arrives after the switch
5. **Pause / resume.** A button labelled `Pause updates` stops polling. While paused, its label is
   `Resume updates`. Clicking it again checks right away, then resumes polling.
6. **Cleanup.** Once the component unmounts, `fetchStatus` must never be called again.

## Constraints

- Plain React only (no data-fetching libraries). This exercise is about getting effects right by hand.

## Run the tests

```bash
npx vitest src/module-02-hooks/01-realm-status
```

## Be ready to answer out loud

- Walk through what happens, in order, when `realmId` changes: which cleanup runs, and when?
- How does your component ignore a slow response for the old Realm? Name another way to do it.
- `role="status"` is a live region, so does a screen reader announce every 15 seconds? (Think about when a live region speaks.)
- Polling vs. WebSockets vs. Server-Sent Events: when would you push for something other than polling?
