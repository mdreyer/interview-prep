# 2.3 Offline-Aware Purchase Button (`useSyncExternalStore`)

**Difficulty:** Intermediate · **Suggested time:** 20 minutes
**Skills:** subscribing to browser APIs, `useSyncExternalStore`, writing a custom hook

## The ticket

> Players on flaky connections (phones, school Wi-Fi) sometimes click "Complete purchase" while
> offline, and then the checkout hangs. Detect when the browser goes offline, disable the purchase
> button, and tell the player why.

You'll edit `OnlineStatus.tsx`, which contains a hook and a component.

## Requirements

### `useOnlineStatus(): boolean`
- Returns `navigator.onLine`, and stays up to date when the window fires `online` / `offline` events.
- It must be **correct on the very first render** (a player who loads the page while offline never sees an
  enabled button, not even briefly).
- Removes its event listeners on unmount.
- **Build it with `useSyncExternalStore`**, not `useState` + `useEffect`. Use `true` as the server snapshot.

### `PurchaseButton`
1. A button labelled `Complete purchase` that calls `onPurchase` when clicked.
2. While offline:
   - the button is disabled
   - an element with `role="status"` shows `You're offline. Reconnect to complete your purchase.`
3. While online, that status element is still on the page but empty (remember why from 1.2?).

## Run the tests

```bash
npx vitest src/module-02-hooks/03-online-status
```

## Be ready to answer out loud

- Why `useSyncExternalStore` instead of `useState` + `useEffect`? Name two problems it avoids.
  (Hint: "tearing" in concurrent rendering, and the first-render value.)
- What is `getServerSnapshot` for, and why `true`?
- Your `subscribe` function: why should it be defined **outside** the component (or memoized)?
- `navigator.onLine === true` doesn't guarantee the API is reachable. What would you do at checkout time anyway?
