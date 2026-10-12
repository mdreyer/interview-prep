# 6.1 Redeem a Code (`useActionState` + `useFormStatus`)

**Difficulty:** Intermediate+ · **Suggested time:** 35 minutes
**Skills:** React 19 form actions, `useActionState`, `useFormStatus`, uncontrolled inputs with `FormData`, React's automatic form reset

## The ticket

> minecraft.net/redeem: players type the 25-character code from a gift card and get their item. Build the form the
> React 19 way: no `onSubmit`, no `useState` for the input, no hand-rolled `isPending` flag.

You'll edit `RedeemCodeForm.tsx`.

## Requirements

1. `normalizeCode(raw)`: remove spaces and dashes, uppercase the rest.
2. A `<form action={formAction}>` where `formAction` comes from **`useActionState`**. A `Code` input with `name="code"`,
   **uncontrolled**: read it from the `FormData` your action receives, not from React state. A `Redeem` submit button.
3. While the action runs, the button reads `Redeeming…` and is disabled. Get that from **`useFormStatus`**, which has
   to be called in a **child component** of the form. (Why? Read the docs' "Pitfall" box, then explain it out loud.)
4. In the action:
   - normalize the code. If it isn't exactly 25 letters and digits, the state becomes the error
     `Codes are 25 letters and numbers, like XXXXX-XXXXX-XXXXX-XXXXX-XXXXX.`, **without** calling `redeemCode`.
   - otherwise `await redeemCode(normalized)`. It resolves to a result union (failures here aren't exceptions):

| Result | What to show |
|---|---|
| `{ ok: true, itemName }` | `role="status"`: `Redeemed: Creeper Hoodie!` |
| `{ ok: false, reason: 'already-redeemed' }` | `This code has already been redeemed.` |
| `{ ok: false, reason: 'not-found' }` | `We couldn't find that code. Check it and try again.` |
| `{ ok: false, reason: 'expired' }` | `This code has expired.` |
| it **throws** | `Something went wrong. Try again.` |

5. Errors appear in a `role="alert"` connected to the input with `aria-describedby`, and the input gets `aria-invalid="true"`.
6. **The trap:** React 19 **resets the form** after every action finishes, success or not. On success that's what you
   want (the field clears). On an error, the player would lose what they typed. Make the input **keep the text the player
   submitted** when there's an error, while staying uncontrolled.
   <details><summary>Hint</summary>Your action can return anything as state, including what was submitted. What attribute decides what an uncontrolled input resets <em>to</em>?</details>

## Run the tests

```bash
npx vitest src/module-06-react19/01-redeem-code
```

## Be ready to answer out loud

- What does `useActionState` give you that `useState` + an `onSubmit` handler + an `isPending` flag doesn't?
  (Actions run in a transition, and calls to the same action are queued in order.)
- Why can't `useFormStatus` be called in the component that renders the `<form>`?
- When is a **controlled** input still the right choice? (Live validation, formatting as you type,
  a character counter: anything that needs the value on every keystroke.)
- This form works before JavaScript loads if the action is a **Server Action** (Next.js). How does that "progressive
  enhancement" story change if the action is a client function, like here?
- Should the client validate the format at all, if the server checks the code anyway?
