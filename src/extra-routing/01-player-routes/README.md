# R.1 Player Profile Routes (React Router: the URL as the source of truth)

**Difficulty:** Intermediate+ · **Suggested time:** 40 minutes
**Skills:** React Router v7, nested and layout routes, path params, `NavLink`, redirects with `replace`, `useNavigate`, validating params, URL encoding

## Setup (once)

This exercise needs React Router, which the other modules don't:

```bash
npm install react-router
```

(In StackBlitz, the terminal works, or add `"react-router": "^7.6.0"` to `dependencies` in `package.json` and let it reinstall.)

## The ticket

> Player profiles have three sections: Overview, Skins and Achievements. Right now the section lives in component state,
> so a shared link always opens on Overview, Back leaves the page entirely, and refreshing forgets where you were.
> Put the player and the section **in the URL**: `/players/Steve/skins`.

You'll edit `PlayerRoutes.tsx`. The section content is given in `sections.tsx` (`SECTIONS`, each with an `id`, a `label`
and a `Component`), so you can focus on the routing. The tests wrap your component in a `<MemoryRouter>`; in the app it
would sit inside a `<BrowserRouter>`.

## Requirements

**Routes**
1. `/players/:username/:section` shows the player page: an `<h1>` with the username, a `<nav aria-label="Profile sections">`
   with one **link** per entry in `SECTIONS`, a "Go to player" form, and the section's content below.
2. `/players/:username` on its own **redirects** to `/players/:username/overview`, **replacing** the history entry
   (so Back doesn't land on the redirect and bounce forward again).
3. An unknown section (`/players/Steve/emotes`) still shows the player's heading and nav, plus a `role="alert"` reading
   `Unknown section "emotes".` and a `Go to the overview` link.
4. Any other URL shows `<h1>Page not found</h1>`.

**Links**
5. The section links are real `<a href>` links (`/players/Steve/skins`), not buttons with `onClick`. The current one has
   `aria-current="page"`, and only that one.
6. Clicking a section pushes a history entry: Back returns to the previous section.

**Go to player**
7. A text input labelled `Go to player` and a `Go` button (Enter submits too). It navigates to the trimmed name, **keeping the
   current section**, e.g. from `/players/Steve/skins`, "Alex" goes to `/players/Alex/skins`. From an unknown section, go to `overview`.
   Ignore a blank name.
8. Names go into the URL **encoded** (`Mr Redstone` → `/players/Mr%20Redstone/…`), and the page shows them decoded.

<details><summary>Hint 1: the shape of the routes</summary>

A **layout route** renders the part every section shares (heading, nav, form) once, and an `<Outlet />` where the matching child goes:

```tsx
<Routes>
  <Route path="/players/:username" element={<PlayerProfile />}>
    <Route index element={/* requirement 2 */} />
    <Route path=":section" element={/* requirement 3, or the section */} />
  </Route>
  <Route path="*" element={/* requirement 4 */} />
</Routes>
```
</details>

<details><summary>Hint 2: links that know where they are</summary>

A `to` without a leading `/` is **relative to the route that renders it**. Inside the layout route, `<NavLink to="skins">` becomes
`/players/Steve/skins`, with the username filled in and encoded for you. `NavLink` also sets `aria-current="page"` on its own when it matches.
</details>

<details><summary>Hint 3: reading the section in the layout</summary>

`useParams()` in the layout gives you `username`, and also the params its child matched. The section id comes from the URL,
so treat it as untrusted: check it against `SECTIONS` before using it.
</details>

## Run the tests

```bash
npx vitest src/extra-routing
```

## Try it in the playground

```tsx
import { BrowserRouter } from 'react-router';
import { PlayerRoutes } from './extra-routing/01-player-routes/PlayerRoutes';

<BrowserRouter>
  <PlayerRoutes />
</BrowserRouter>
```

Then open `/players/Steve/skins` in the preview's address bar, click around, and use Back and Forward.

## Be ready to answer out loud

- **Path param or query param?** `/players/Steve/skins` vs `/players/Steve?tab=skins`. (Path for *what* you're looking at and
  its hierarchy; query for *how* you're looking at it: filters, sort, page number. Both are shareable and survive refresh.)
- **`push` vs `replace`:** when is each right? (Push for a navigation the player chose; replace for redirects, fixing up an invalid
  URL, and updates the player wouldn't think of as a "page", like typing in a search box. 4.4 used `replaceState` for that.)
- **Links or buttons?** Why `<a href>` here, and why `aria-current="page"` rather than the ARIA tabs pattern from 6.4?
  (They change the URL, so they're navigation: middle-click, copy link and "open in new tab" all work. ARIA tabs are for
  panels within one page. Mixing the two (`role="tab"` on links) is debated; links in a `<nav>` is the safe choice.)
- **Deep links in production:** `BrowserRouter` works in dev, but refreshing `/players/Steve/skins` on the real site returns a 404.
  Why, and how do you fix it? (The server has no file at that path. It must fall back to `index.html` for app routes: in ASP.NET Core,
  `app.MapFallbackToFile("index.html")`; on Azure Static Web Apps, a `navigationFallback` rule.)
- **After a route change**, what should happen to focus and scroll for keyboard and screen-reader users? (Scroll to the top or restore the old
  position, and move focus to the new `<h1>` or announce the page title: a full page load does that for free, a client-side navigation doesn't. That's 4.2.)
- **Big apps:** how would you code-split by route? (7.3: `lazy()` per route, or React Router's `lazy` route property.) And where would the
  player's data be fetched? (In the component with a cache like 6.3 or TanStack Query, or in a route **loader** so it starts in parallel with the code.)
