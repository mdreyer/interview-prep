# 1.2 Profile Settings Form

**Difficulty:** Foundation+ · **Suggested time:** 30 minutes
**Skills:** controlled forms, checking whether the form has changed, validation, accessible error messages, announcing status to screen readers

## The ticket

> On the Minecraft.net profile page, players can change their gamertag, the language
> the site displays in, and whether they get marketing emails. Build the settings form.

You'll edit `ProfileSettingsForm.tsx`. The types and a `LANGUAGES` list are already written.

## Requirements

1. **Fields** (each one needs a proper label):
   - a text input labelled `Gamertag`
   - a `<select>` labelled `Language`, with one `<option>` per entry in `LANGUAGES` (the value is the locale code, the text is its `label`)
   - a checkbox labelled `Send me news and offers`
   - all three start from `initialValues`
2. **Gamertag validation.** Check the **trimmed** value:
   - fewer than 3 or more than 16 characters → `Gamertag must be between 3 and 16 characters.`
   - any character other than A–Z, a–z, 0–9, or `_` → `Gamertag can only use letters, numbers, and underscores.`
   - check length first, and show only one message at a time
   - while the gamertag is invalid, the input must have `aria-invalid="true"`, and the error message must be connected to the input with `aria-describedby`
3. **Detecting changes.** The form counts as changed when its values (with the gamertag trimmed) are different from the **last saved values**. At first, the last saved values are `initialValues`.
   - If the player types a change and then types it back, the form is **not** changed.
   - Adding a trailing space to the gamertag is **not** a change.
4. **Save** button (`Save changes`): disabled unless the form has changed **and** is valid. Submitting
   (clicking the button or pressing Enter in the gamertag field) calls `onSave(values)` with the gamertag trimmed.
   After a save, those values become the new "last saved" values, and the gamertag input shows the trimmed value.
5. **Reset** button (`Reset`): disabled unless the form has changed. Clicking it puts every field back to the last saved values.
6. **Status message.** Keep an element with `role="status"` on the page at all times. After a successful save
   it says `Settings saved`. Clear it as soon as the player edits any field again.

## Constraints

- One source of truth: don't keep separate `isDirty` or `isValid` state. Calculate both from the values.
- Don't use any form libraries. This round is plain React.

## Run the tests

```bash
npx vitest src/module-01-warmup/02-profile-settings
```

## Be ready to answer out loud

- Why should the `role="status"` element already be on the page *before* the message appears?
- `aria-invalid` + `aria-describedby`: what does each one do for a screen-reader user?
- Suppose the parent later passes in a different `initialValues` (another account loads). This
  component won't update. Why not, and what are two ways to fix it? (Hint: one way uses `key`.)
