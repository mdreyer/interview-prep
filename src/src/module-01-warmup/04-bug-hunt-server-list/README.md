# 1.4 Bug Hunt: Favorite Servers

**Difficulty:** Intermediate · **Suggested time:** 20 minutes
**Skills:** reading and debugging someone else's React, list keys and component identity, immutable updates, copying props into state by mistake

## The ticket

> QA filed a pile of bugs against the "Favorite servers" panel on the profile page.
> A contractor wrote it and then left. Fix it.

`ServerList.tsx` **already works partly**, but it has **7 bugs**. The tests describe the behavior
it's supposed to have, and most of them fail right now. Fix the component so every test passes.

Interviewers love this format ("here's a broken component, talk me through it"), so practice it out loud:
**name each bug, say why it happens, then fix it.** Leave a short `// FIX:` comment next to each change.

## Intended behavior

1. The heading reads `Favorite servers ({count})` and always matches the number of servers.
2. Each server row shows its name and address, a `Notes for {name}` text input that is local to that row,
   a `Move {name} up` button (disabled on the first row), and a `Remove {name}` button.
3. A note stays with **its own server** when rows are moved or removed.
4. The add form has `Server name` and `Server address` inputs. `Add server` is disabled until **both** are filled in
   (ignoring whitespace). After adding, both inputs are cleared.
5. Every server has a unique id, including servers added after others were removed.

## Rules

- Keep the structure: `ServerRow` keeps its own `note` state. Don't lift notes into the parent.
  The point is to fix *why* the state ends up on the wrong row.
- Don't touch the tests.

## Run the tests

```bash
npx vitest src/module-01-warmup/04-bug-hunt-server-list
```

## Be ready to answer out loud

- How does React decide whether a component instance (and its state) is kept or thrown away?
- `setServers(servers)` after `servers.push(...)`: what exactly does React compare, and why does nothing happen?
- Name two different ways to generate unique ids on the client, and when you'd let the server assign them instead.
