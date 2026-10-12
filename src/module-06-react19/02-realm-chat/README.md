# 6.2 Realm Chat (`useOptimistic`)

**Difficulty:** Advanced · **Suggested time:** 40 minutes
**Skills:** `useOptimistic`, async transitions, `startTransition` after `await`, keeping failures visible, knowing when *not* to use a form action

## The ticket

> Realm chat on the web feels laggy: your own message only shows up after the server echoes it back.
> Show it instantly, and if it fails, don't silently lose what the player wrote.

You'll edit `RealmChat.tsx`. You did optimistic UI by hand in 5.4. This time React keeps track of it for you.

## Requirements

1. Render the messages in a `<ul aria-label="Messages">`, one `<li>` each: `<strong>{author}</strong>: {text}`.
2. A form with a `Message` input and a `Send` button. Trim the text, and don't send blank messages.
3. **Optimistic:** the moment the player sends, their message appears at the end of the list with ` (Sending…)` after it,
   and the input **clears right away**, so they can type the next one.
4. When `sendMessage` resolves, the saved message (from the server) replaces the optimistic one: same position, no "Sending…", no duplicate.
5. When it rejects, the message **stays** in the list with ` (Not sent) ` and a `Retry` button whose accessible name is
   `Retry sending "{text}"`. (`useOptimistic` throws optimistic items away when the transition ends, so failed messages
   must live in **real** state.)
6. `Retry` removes the failed entry and sends the same text again, optimistically.
7. Several messages can be in flight at once.
8. **Don't wipe the player's typing:** if they start the next message while the previous one is sending, finishing the
   first send must not clear the input.
   <details><summary>Hint</summary>A <code>&lt;form action&gt;</code> resets the form when its action <em>finishes</em>, which is exactly what you don't want here. Use <code>onSubmit</code> + <code>startTransition(async () =&gt; …)</code>, and a controlled input you clear yourself.</details>

Use **`useOptimistic(messages, reducer)`**, and call its setter **inside** a transition.

## Run the tests

```bash
npx vitest src/module-06-react19/02-realm-chat
```

## Be ready to answer out loud

- What does `useOptimistic` do when the transition finishes? Why does that make "success" easy and "failure" need extra work?
- Why do the docs tell you to wrap state updates that come **after an `await`** in another `startTransition`?
- Compare this with your 5.4 version. Which problems did `useOptimistic` solve, and which (out-of-order responses, rollback target) are still yours?
- Chat messages need a **stable key** from the moment they're shown. What's the risk when the temporary ID changes to the server's ID?
  (A remount of that `<li>`. Harmless here, but bad if it held focus or an animation. Some APIs accept a client-generated ID for exactly this reason.)
- How would messages from *other* players arrive? (WebSocket or SignalR on the C# side, with a store that the socket writes to and React subscribes to: `useSyncExternalStore` again.)
