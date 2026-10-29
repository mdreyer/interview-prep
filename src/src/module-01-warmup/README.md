# Module 1: Warm-up and Re-activation (about 2 hours)

| # | Problem | Level | Time | Tests |
|---|---|---|---|---|
| — | [Quick-fire Q&A](./QUICKFIRE.md) | — | 15 min | (out loud) |
| 1.1 | [Minecoin Bundle Picker](./01-bundle-picker/README.md) | Foundation | 20 min | 8 |
| 1.2 | [Profile Settings Form](./02-profile-settings/README.md) | Foundation+ | 30 min | 14 |
| 1.3 | [Realm Invite Manager](./03-realm-invites/README.md) | Intermediate | 35 min | 9 |
| 1.4 | [Bug Hunt: Favorite Servers](./04-bug-hunt-server-list/README.md) | Intermediate | 20 min | 7 |

Run all of them with `npx vitest src/module-01-warmup`, or one at a time by pointing at its folder.

**Tip:** the tests look elements up **by role and accessible name** (`getByRole('button', { name: 'Buy now' })`),
the same way assistive technology does. When a test can't find your element, the fix is almost always correct
HTML semantics, which is exactly what Minecraft.net's accessibility bar expects anyway.
