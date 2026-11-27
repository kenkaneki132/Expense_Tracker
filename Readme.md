# 📊 Expense Tracker (Full Stack)

A React + TypeScript single-page app for tracking expenses, backed by a **Node/Express REST API** and **PostgreSQL**.

**Live demo:** https://kenkaneki132.github.io/Expense_Tracker/ (browser-storage mode, no backend needed)

![TypeScript](https://img.shields.io/badge/TypeScript-React%2019-3178C6?logo=typescript&logoColor=white)
![Node](https://img.shields.io/badge/Node-Express-339933?logo=node.js&logoColor=white)
![Postgres](https://img.shields.io/badge/DB-PostgreSQL-4169E1?logo=postgresql&logoColor=white)
![Tests](https://img.shields.io/badge/tests-node%3Atest%20%2B%20vitest-success)

## Features

- Add, edit and delete expenses with title, description, category and amount (**cents supported**)
- Filter by category, sort any column, export to **CSV** (with spreadsheet-formula injection protection)
- **Spending summary:** total, this month, count, largest expense and a per-category bar chart
- Field-level validation on both client and server, with server errors shown next to the right input
- Runs three ways: Postgres, an **in-memory store** when `DATABASE_URL` isn't set, or **browser localStorage** (`VITE_STORAGE=local`) for static hosting

## Run it on a new machine

**Requirements:** **Node.js 20.19+ or 22.12+** (the client uses Vite 7; CI uses Node 22) and npm. **PostgreSQL 14+ is optional**: without `DATABASE_URL` the API uses an in-memory store, and with `VITE_STORAGE=local` the client needs no backend at all.

```bash
git clone https://github.com/kenkaneki132/Expense_Tracker.git
cd Expense_Tracker

# backend
cd backend && npm ci
cp .env.example .env              # optional: leave DATABASE_URL unset to use the in-memory store
createdb expense_tracker && psql expense_tracker -f init.sql   # only if using Postgres
npm run dev                       # API on :3001

# client (new terminal)
cd client && npm ci
cp .env.example .env
npm run dev                       # http://localhost:5173
```

No backend? `cd client && VITE_STORAGE=local npm run dev` (PowerShell: `$env:VITE_STORAGE='local'; npm run dev`).

Run every check the way CI does: `cd backend && npm test`, then `cd ../client && npm test && npm run build`. `npm ci` installs the exact versions in `package-lock.json`; use `npm install` only when you mean to change dependencies.

## API

| Method | Route | Notes |
|---|---|---|
| `GET` | `/expenses?category=Food` | newest first; unknown category → 400 |
| `GET` | `/expenses/summary` | `{ total, count, byCategory }` |
| `POST` | `/expenses` | `{ title, category, amount, description? }` → 201, or 400 with `errors` per field |
| `PUT` | `/expenses/:id` | 400 invalid id/body, 404 unknown id |
| `DELETE` | `/expenses/:id` | 400 invalid id, 404 unknown id |
| `GET` | `/categories`, `/health` | |

## Architecture

```
backend/
  app.js            createApp(repo): Express app (exported for tests)
  routes/expenses.js  thin handlers: validate → repo → JSON
  validation.js     pure validation (amount, title, category, id)
  repository.js     createPgRepo(pool) | createMemoryRepo()
  index.js          picks Postgres when DATABASE_URL is set, else in-memory
client/src/
  lib/expenses.ts   validation, summary, CSV, money formatting (pure)
  services/api.ts   createHttpApi() | createLocalApi(localStorage)
  components/       ExpenseForm · ExpenseList · ExpenseFilter · SummaryPanel
```

## Tests

```bash
cd backend && npm test     # 26 tests: node:test + real HTTP calls against the in-memory app
cd client  && npm test     # 32 tests: Vitest for validation, summary, CSV, both API clients
```

Both suites run in CI (`.github/workflows/tests.yml`).

## Changelog (portfolio-upgrade)

- **Cents were lost:** the `amount` column was `INTEGER` and the form used `parseInt`, so `12.50` became `12` or `13`. It is now `NUMERIC(12,2)` end to end (`init.sql` includes the `ALTER` for existing databases).
- **Validation:** `isNaN('')` let empty amounts through, and negative amounts, unknown categories and non-numeric ids fell through to a generic 500 "Database error". All of these are now 400s with per-field messages.
- Malformed JSON returns 400, unexpected errors return a clean 500, and async errors no longer go unhandled.
- Removed committed `.env` files (they contained a database password) and added `.env.example` files.
- Added the summary panel, loading/error states, browser-storage mode, GitHub Pages deploy and CI.
