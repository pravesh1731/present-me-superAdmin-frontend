# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm install
npm run present   # dev server (the script is "present", not "dev"); open http://localhost:5173/superadmin
npm run build     # production build to dist/
npm run preview   # serve the built dist/
npm run lint      # ESLint 9 flat config (eslint.config.js)
```

There is no test framework or test script in this repo.

`npm run lint` currently reports pre-existing errors. Several `'motion' is defined but never used` errors are false positives: `motion` is used as `<motion.div>` in JSX, and the config has no `react/jsx-uses-vars` rule to mark that as a use.

## Stack

React 19 + Vite 7, plain JavaScript/JSX (no TypeScript). Tailwind CSS v4 through `@tailwindcss/vite`; `src/index.css` is just `@import "tailwindcss"` and there is no tailwind config file. Also: Redux Toolkit, React Router v7 (`createBrowserRouter`), axios, framer-motion, lucide-react. `vite.config.js` loads only the Tailwind plugin; `@vitejs/plugin-react` is installed but not registered.

## Architecture

This is the super-admin panel of the Present-Me platform. It is a frontend only and talks to a separate backend.

**Base path `/superadmin`.** Vite has `base: '/superadmin/'`, and every route in `src/App.jsx` is an absolute `/superadmin/...` path. New routes, `navigate()` calls and sidebar links must include that prefix. Page titles come from `titleMap` in `src/Components/Header/Header.jsx`, so add an entry there when you add a route.

**Layout and auth gate.** `Header.jsx` is the layout route for every page except sign-in. It renders the `Sidebar` plus an `<Outlet />`. On mount it calls `GET /sadmin/profile`, stores the result in Redux (`addUser`), and redirects to `/superadmin/signin` on a 401. Children render only after that request finishes. This is also how the session survives a page refresh. The header reads `user.admin.firstName`/`lastName`.

**API calls.** Components call axios directly; there is no API client, interceptor or service layer. Every request is `BaseUrl + "/sadmin/..."` with `{ withCredentials: true }`, because auth is a cookie set by `POST /sadmin/login`. `BaseUrl` (`src/Components/utils/constants.jsx`) is `http://localhost:2000` when the page is served from `localhost` and `/api` otherwise. In production the backend is expected behind the same origin at `/api`.

The backend is the sibling repo `../Present-Me-Backend` (Express + DynamoDB); its README has the full API table. Endpoints this app uses:
- `/sadmin/login`, `/sadmin/logout`, `/sadmin/profile`
- `GET /sadmin/overview` (dashboard counts, 6-month sign-up trend, latest activity; cached ~60s server-side, `?refresh=1` bypasses)
- `/sadmin/pendingInstitutes`, `/sadmin/verifiedInstitutes`, `PATCH /sadmin/institutes/:id/status` (`verified` | `rejected`)
- `GET /sadmin/institutes/:id/teachers` and `/students` (one institute's people, used by the Verified details tabs)
- `GET /sadmin/teachers` and `/sadmin/students` (all institutes; server-side `page`, `pageSize`, `search`, `institutionId`, `status`/`verified`, `sort`)
- `/sadmin/pyq-notes` (GET), plus `/upload`, `/:noteId/verify` and `/:noteId/reject` (all POST)
- `/sadmin/withdrawals` (GET, cursor-paginated), `PATCH /sadmin/withdrawals/:id/status`

Responses are wrapped as `{ data: [...] }`. The backend strips password/token hashes from these responses; the UI also hides any credential-looking field (`isSensitiveKey` in `utils/format.js`) as a second line of defence.

**Redux store.** `src/Components/utils/`: `userSlice` (profile), `instituteSlice` and `overviewSlice`. The `institute` slice holds `pending`, `verified`, `selected` and `counts`; the list pages dispatch the whole `response.data` object into `pending`/`verified`, so consumers read `state.institute.pending.data` as the array. `overviewSlice` holds the `/sadmin/overview` payload: the Sidebar loads it on mount (badges), the Dashboard reads it, and `loadOverview(dispatch, { force: true })` (`utils/overview.js`) refreshes it after any approve/verify/reject/pay action.

**Detail pages.** `PendingInstituteDetailsPage` and `VerifiedInstituteDetailsPage` first look up the institute by `institutionId` in Redux. On a hard refresh the store is empty, so they refetch the full list and `.find()` the record. There is no fetch-by-id endpoint. The Verified page's tab is URL-driven (`?tab=Teachers`).

**Pages and data.** Every page is live: Dashboard (overview), Pending/Verified institutes, PYQ & Notes, Withdrawals, Teachers and Students (both are thin configs over `Components/people/PeopleListPage.jsx`). Dashboard, PYQ and Withdrawals accept deep-link query params (`?status=`, `?type=`, `?institutionId=`, `?search=`) so cards and the command palette can open a pre-filtered list. `src/data/` is unused mock data and `src/Pages/Home/PendingInstitute.jsx` (outside the `PendingInstitute/` folder) is not routed.

**Layout shell.** `Components/Header/Header.jsx` is the layout route: fixed header (breadcrumbs, Ctrl/Cmd+K command palette, notification bell, profile menu), the Sidebar, and a fade-in `<Outlet />`. The palette (`CommandPalette.jsx`) searches pages/actions locally, institutes from the two institute lists, and people through `/sadmin/teachers|students?search=`.

**Shared code.** `Components/common/ui.jsx` (StatCard, Pill, Toast, ConfirmDialog, avatars, detail rows), `Components/institute/` (details, documents, per-institute people panels), `Components/utils/format.js` (dates, money, CSV export, status helper) and `useToast.js`. PYQ & Notes and Withdrawals still carry their own local copies of a few of these.

**Gotchas.** Dev URL needs the trailing slash (`/superadmin/`). The backend `Scan` calls filter *after* `Limit`, so a filtered notes/withdrawals page can come back short even when more matches exist; follow `nextCursor`. `eslint` reports `'motion' is defined but never used` for every `<motion.div>` file: it is a false positive (no jsx-uses-vars rule), not a real error.

**Styling conventions.** Inline Tailwind classes throughout. Header, sidebar and the dashboard hero share the brand gradient (`from-[#0BCCEB] to-[#0A80F5]`, with a faint text-shadow on white labels for legibility); primary action colour is `#0A80F5`. Keep this theme when changing UI. Brand gradient: `bg-linear-to-br from-[#0BCCEB] to-[#0A80F5]` (Tailwind v4 uses `bg-linear-*`, not `bg-gradient-*`).
