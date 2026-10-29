# 1.3 Realm Invite Manager

**Difficulty:** Intermediate · **Suggested time:** 35 minutes
**Skills:** lifting state up, splitting into components, never mutating props or state, calculated lists (filter and sort), list keys

## The ticket

> Realm owners can invite friends to their Realm from Minecraft.net. Build the invite manager:
> search your friends list, add friends to a pending-invites list, then send all the invites at once.

You'll edit `RealmInvites.tsx`. Test data is in `friends.fixture.ts`.

## Requirements

1. **Structure.** `RealmInvites` owns the state. Split the UI into **at least two child components**
   (for example, `FriendList` and `InviteList`) that receive data and callbacks through props.
   The tests can't check this, but an interviewer will.
2. **Search.** Add an `<input type="search">` labelled `Search friends`. It filters the friends list by gamertag,
   matching any part of the name and ignoring case.
   If nothing matches, show `No friends match "{query}".`
3. **Friends list.** Use a `<ul aria-label="Friends">` with one `<li>` per friend that matches the search, showing their gamertag.
   - **Order:** online friends first, then offline friends. Within each group, sort alphabetically **ignoring case**.
   - Each row has a button whose accessible name is `Invite {gamertag}`. It's disabled if that friend
     is already invited, or if the invite limit has been reached.
4. **Pending invites.**
   - With no invites, show `No invites yet.`
   - Otherwise, use a `<ul aria-label="Pending invites">` listing invited friends **in the order they were invited**,
     each with a `Remove {gamertag}` button.
   - Searching never removes anyone from the pending list.
5. **Limit.** `maxInvites` defaults to 10. Show a counter such as `3 of 10 invites`. At the limit, show
   `Invite limit reached`.
6. **Send.** The `Send invites` button is disabled when there are no invites. Clicking it calls
   `onSendInvites(ids)` with the friend ids **in the order they were invited**, then clears the pending list.

## Constraints

- **Don't mutate the `friends` prop.** The tests pass in a frozen array, so `friends.sort()` will throw.
- Store as little state as possible. Ask yourself: do you need to store the invited `Friend` objects,
  or just their ids? What's the trade-off?

## Run the tests

```bash
npx vitest src/module-01-warmup/03-realm-invites
```

## Be ready to answer out loud

- Where does each piece of state live, and why there?
- What would go wrong if the list key were the array index, given that the list re-sorts and re-filters?
- The friends list could have 2,000 entries. Where is the sorting cost, and when would you reach for `useMemo`?
  (Module 7 covers this properly. For now, give your first instinct.)
