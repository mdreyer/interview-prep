# 5.3 Server-Side Validation Errors

**Difficulty:** Advanced · **Suggested time:** 40 minutes
**Skills:** mapping ASP.NET Core `ValidationProblemDetails` onto form fields, accessible error messages, focus management, choosing a message for each kind of failure

## The ticket

> Only the server can know a gamertag is taken, or a bio contains a blocked word. Right now the profile page shows
> "Error 400" in a toast and the player has to guess what went wrong. Put the server's messages next to the fields
> they belong to, and give every other failure a message that tells the player what to do next.

You'll edit `ProfileForm.tsx`. `saveProfile` rejects with the `ApiError` from 5.1 (`../ApiError.ts`), so you can use
`error.status`, `error.kind`, `error.fieldErrors` (camelCase keys), `error.title`, `error.detail` and `error.traceId`.

## Requirements

**Form**
1. A `Gamertag` input and a `Bio` textarea, both labelled, starting from `initialProfile`, plus a `Save changes` submit button.
2. While saving, the button reads `Saving…` and is disabled (no double submits).
3. On success, show the profile the server **returned** (the C# API may trim or normalize values), and a
   persistent `role="status"` region that reads `Profile saved.`

**400 with field errors**
4. For each field with an entry in `fieldErrors`, show its **first** message under the field. Set
   `aria-invalid="true"` on the field and connect the message with `aria-describedby`.
5. Move focus to the **first invalid field in form order** (Gamertag before Bio), whatever order the keys arrived in.
6. Editing a field clears **that field's** error (the others stay).
7. Field errors speak for themselves, so don't also show an alert.

**Everything else goes in one `role="alert"` message**
| Failure | Message |
|---|---|
| 400 with no errors for *this form's* fields | the problem's `detail`, otherwise its `title` |
| 409 Conflict | `This profile was changed somewhere else. Reload the page to get the latest version.` |
| `kind: 'network'` | `Couldn't reach Minecraft.net. Check your connection and try again.` |
| any other `ApiError` | `Something went wrong. Try again. (Reference: <traceId>)`, leaving out the reference when there's no `traceId` |
| not an `ApiError` at all | `Something went wrong. Try again.` (never show raw `error.message` to players) |

8. Starting a new save clears the previous alert and success message.

## Run the tests

```bash
npx vitest src/module-05-api/03-server-validation
```

## Be ready to answer out loud

- Client-side validation exists too (`required`, `maxLength`, a regex). Why must the C# API validate again anyway?
- Why focus the first invalid field instead of announcing a summary? When would a summary list
  (with links to each field) be better? (Long forms: see the GOV.UK error-summary pattern.)
- Why show the trace ID? Who reads it?
- `409 Conflict` usually comes from optimistic concurrency: an `ETag` / `If-Match` header, or a `RowVersion` column in
  EF Core. Walk through what happens when the same player saves from two tabs.
- Where would you get these error messages translated? (Module 9: does the server localize them, or does the client map error *codes* to its own strings?)
