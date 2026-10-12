# 5.4 Optimistic Wishlist Toggle (by hand)

**Difficulty:** Advanced · **Suggested time:** 30 minutes
**Skills:** optimistic updates, rollback, out-of-order responses, `useRef` for values that don't render, toggle-button accessibility

## The ticket

> The ♥ Wishlist button on Marketplace items waits for the server before it changes, so it feels broken on slow
> connections and players click it three times. Make it flip instantly, and quietly put things right if the server says no.

You'll edit `WishlistButton.tsx`. You'll build this one **by hand** with `useState` and `useRef`. In Module 6 you'll
meet React 19's `useOptimistic`, and having done it manually first you'll see what it does for you, and what it doesn't.

## Requirements

1. A `<button>` named `Wishlist {itemName}`, e.g. `Wishlist Creeper Hoodie`. Its **name never changes**: the on/off
   state is `aria-pressed`. (If you want only "Wishlist" visible, hide the item name visually, not from screen readers.)
2. **Optimistic:** clicking flips `aria-pressed` **immediately** and calls `setWishlisted(itemId, newValue)`.
3. Success → keep it. Failure → **roll back** and show `role="alert"`: `Couldn't update your wishlist. Try again.`
4. The next click clears the alert.
5. **Don't block clicks** while a request is in flight. Each click flips the UI and sends its own request.
6. **Responses can arrive out of order.** Only the outcome of the **latest** request may change what's shown. An
   older request failing late must not cause a rollback or an alert.
7. **Roll back to what the server last confirmed**, not to "the opposite of what I just clicked", and not to
   `initialWishlisted`. Any success tells you what the server holds, even a late one, unless a newer request has already succeeded.

## Run the tests

```bash
npx vitest src/module-05-api/04-optimistic-wishlist
```

## Be ready to answer out loud

- When is optimistic UI a **bad** idea? (Hint: would you do it for "Buy 1,720 Minecoins"?)
- Why are the "latest request" and "last confirmed value" `useRef`s rather than state? What would go wrong if they were state?
- Requests can also *apply* out of order on the server: request 1 lands after request 2. How would the API prevent that?
  (Sequence numbers, `If-Match` / ETags, or `PUT` with the full desired state rather than a "toggle" endpoint.)
- Another option is to disable the button while a request is pending. What does that cost the player, and what does it save you?
- With TanStack Query you'd do this in `onMutate` / `onError` / `onSettled`. What does each one correspond to in your code?
