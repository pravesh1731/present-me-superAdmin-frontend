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

Endpoints in use:
- `/sadmin/login`, `/sadmin/logout`, `/sadmin/profile`
- `/sadmin/pendingInstitutes`, `/sadmin/verifiedInstitutes`
- `PATCH /sadmin/institutes/:id/status`
- `/sadmin/pyq-notes` (GET), plus `/upload`, `/:noteId/verify` and `/:noteId/reject` (all POST)
- `/sadmin/withdrawals` (GET, cursor-paginated), `PATCH /sadmin/withdrawals/:id/status`

Responses are wrapped as `{ data: [...] }`.

**Redux store.** The store lives in `src/Components/utils/` (`appstore.js`, `userSlice.js`, `instituteSlice.js`). The `institute` slice holds `pending`, `verified`, `selected` and `counts`. Watch out: the list pages dispatch the whole `response.data` object into `pending`/`verified`, even though the initial state is `[]`. Consumers therefore read `state.institute.pending.data` as the array. The Sidebar fetches the counts into `counts.pending`/`counts.verified` for the Dashboard.

**Detail pages.** `PendingInstituteDetailsPage` and `VerifiedInstituteDetailsPage` first look up the institute by `institutionId` in Redux. On a hard refresh the store is empty, so they refetch the full list and `.find()` the record. There is no fetch-by-id endpoint.

**Live vs. mock pages.** These pages call the backend: institutes, PYQ & Notes (`src/Pages/Home/Pyq&Notes.jsx`) and Withdrawals. `Teacher.jsx` and `Student.jsx` use hard-coded arrays. Most of `Dashboard.jsx` is static, apart from the institute counts. Files in `src/data/` are mock data and are mostly unused. `src/Pages/Home/PendingInstitute.jsx` (outside the `PendingInstitute/` folder) is not routed and is dead code.

**Styling conventions.** Everything uses inline Tailwind classes; there are no shared UI components. Pages are large single files with helpers and sub-components defined inside. Brand gradient: `bg-linear-to-br from-[#0BCCEB] to-[#0A80F5]` (Tailwind v4 uses `bg-linear-*`, not `bg-gradient-*`).
