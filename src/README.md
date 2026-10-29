# React + TypeScript practice

Each module adds a folder under `src/`.
Each problem comes with a ticket-style spec (`README.md`), a starter file, and a test suite that tells you when you're done.

## Setup (about 5 minutes, one time)

**Recommended: GitHub + StackBlitz** (nothing to install, and your work is saved):

1. Create a new **public** GitHub repo, for example `mojang-prep`.
2. On the repo page, click **Add file → Upload files**, drag in **everything inside this folder**
   (including `package.json` and `src/`), and commit.
3. Open `https://stackblitz.com/github/<your-username>/mojang-prep`.
   StackBlitz installs the dependencies automatically. Click **Fork** so you can save your edits.
4. In the StackBlitz terminal:
   ```bash
   npx vitest src/module-01-warmup      # tests rerun every time you save
   ```
   Open a second terminal tab and run `npm run dev` if you want to click around the playground UI.

**When a new module arrives** (it comes as a zip of only the new and changed files):
1. In your **StackBlitz fork**, drag the new `src/module-XX-...` folder from the unzipped files onto the `src`
   folder in StackBlitz's file explorer. For changed files (`package.json`, `src/main.tsx`), open each one and paste
   in the new contents.
2. Optional backup: upload the same files to GitHub (**Add file → Upload files**, drag in the *contents* of the
   unzipped folder; files with the same path are replaced).

**Fallback: run locally** (needs Node 20+): `npm install`, then `npx vitest src/module-01-warmup`.

## How to work a problem

1. Read the problem's `README.md`. Start a timer for the suggested time.
2. Turn **AI autocomplete off** (check the editor settings in StackBlitz). Ordinary IntelliSense is fine.
3. Get the tests green. Then answer the "Be ready to answer out loud" questions **out loud**.
4. Paste your component into the chat with Claude for an interviewer-style review.
5. Once a day, redo one problem from scratch in a **plain editor** (the CoderPad sandbox or HackerRank's React
   environment) with no tests. That's the closest thing to interview conditions.

## Roadmap

| Day | Date | Module | Focus |
|---|---|---|---|
| 1 | Tue 10/6 | **1. Warm-up** | State, forms, lists, keys, bug hunt |
| 2 | Wed 10/7 | **2. Hooks in depth** | Effects, cleanup, stale closures, race conditions, custom hooks |
| 3 | Thu 10/8 | **3. TypeScript** | Generics, discriminated unions, narrowing, C#-shaped DTOs |
| 4 | Fri 10/9 | **4. State & architecture** | Checkout as a state machine, reducers, context, URL state |
| 5 | Sat 10/10 | **5. API integration (C#)** | Typed client, ProblemDetails errors, retries, idempotency, optimistic UI |
| 6 | Sun 10/11 | **8. Accessibility** | Dialog focus management, ARIA patterns, live regions, keyboard grids |
| 7 | Mon 10/12 | **10. Security** | XSS, open redirects, CSRF/antiforgery, token storage, CSP |
| 8 | Tue 10/13 | **9. Internationalization** | `Intl`, plurals, RTL, string externalization |
| 9 | Wed 10/14 | **6. Modern React 19** | Actions, `useActionState`, `useOptimistic`, `use()`, transitions |
| 10 | Thu 10/15 | **7. Performance** | Memoization, virtualization, code-splitting, profiling |
| 11 | Fri 10/16 | **11. Component library** | Compound components, polymorphism, API design |
| — | If there's time | Testing · Capstone mock interviews · Behavioral prep | |

Every module includes **about 15 minutes of quick-fire JS/browser fundamentals** (`QUICKFIRE.md`) to rehearse the
question-and-answer part that opens each interview.

**If your interviews land early (10/14):** the order above front-loads the most likely topics. Modules 1–5, 8, 10 and 9
will be done by 10/13. Modules 6, 7 and 11 then shrink to talking-point cheat sheets you can review the night before.
