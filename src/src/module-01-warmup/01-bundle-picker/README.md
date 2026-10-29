# 1.1 Minecoin Bundle Picker

**Difficulty:** Foundation · **Suggested time:** 20 minutes
**Skills:** controlled inputs, state you calculate vs. state you store, list keys, event handlers, and a first look at `Intl`

## The ticket

> Players buy Minecoins on Minecraft.net in bundles. Build the bundle picker for the
> new Minecoins page: the player picks a bundle and a quantity, sees the total, and clicks **Buy now**.

You'll edit `BundlePicker.tsx`. The `Bundle` type and the props are already written.

## Requirements

1. **Bundle choice.** Put the bundles in a `<fieldset>` whose `<legend>` is `Choose a Minecoin bundle`.
   Each bundle gets a radio button. **Each radio's accessible name must be exactly the bundle's name**
   (for example, `Explorer Pack`). Show these details next to each bundle, outside its `<label>`:
   - the coins per bundle (`coins + bonusCoins`), formatted like `1,020 Minecoins`
   - `Includes {bonusCoins} bonus coins`, only when `bonusCoins > 0`
   - the price, formatted like `$5.99`
2. **Nothing selected at first.** No bundle is selected when the picker first loads.
3. **Quantity stepper.** Show the text `Quantity: {n}` with two buttons, `Decrease quantity` and
   `Increase quantity`. Quantity starts at 1 and stays between 1 and `MAX_QUANTITY` (10).
   Disable each button when it would go past a limit.
4. **Summary.**
   - With no bundle selected, show `Select a bundle to see your total.`
   - With a bundle selected, show `Total: {coins} Minecoins` and `Price: {price}`. For example,
     Explorer Pack × 3 shows `Total: 3,060 Minecoins` and `Price: $17.97`.
5. **Buy now.** The `Buy now` button stays disabled until a bundle is selected. Clicking it calls
   `onPurchase({ bundleId, quantity })`.
6. Switching bundles keeps the current quantity.

## Constraints (the kind an interviewer will ask about)

- Prices are **integer cents** (`priceCents`). Don't do money math with floating-point dollars.
- The total and the price are **calculated from the selection on each render**. Don't keep them in state.
- Format numbers with `Intl.NumberFormat` (locale `en-US`, currency `USD` for now; Module 9 makes this fully localized).

## Run the tests

```bash
npx vitest src/module-01-warmup/01-bundle-picker
```

## Be ready to answer out loud

- Why shouldn't the total live in `useState`? What bug shows up if it does?
- What gives a radio button its accessible name, and why does this ticket ask for the bundle name *only*?
- Where would you create the `Intl.NumberFormat` instances, and does it matter?
