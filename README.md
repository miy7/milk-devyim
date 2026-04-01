# milk-devyim

Internal operations dashboard built with Next.js App Router, TypeScript, Tailwind CSS, Prisma, and PostgreSQL.

## What’s included

- Login-based access control with cookie sessions
- Role-aware navigation for `admin`, `manager`, and `employee`
- Executive-style dark dashboard UI
- Work plan management with create, edit, delete, assignment, and filtering
- Dedicated month/week/day calendar
- Employee daily finance tracking with summary totals
- Employee management with role and status control
- Management reports with date-range totals and chart-ready layout
- Prisma schema, seed data, and Vercel-ready structure

## Stack

- Next.js 16 App Router
- React 19
- Tailwind CSS 4
- Prisma 7 with `@prisma/adapter-pg`
- PostgreSQL

## Setup

1. Copy `.env.example` to `.env`.
2. Set `DATABASE_URL` to your PostgreSQL connection string.
3. Set `SESSION_SECRET` to a long random value.
4. Install dependencies and generate the Prisma client:

```bash
npm install
```

5. Push the schema and seed the database:

```bash
npm run db:push
npm run db:seed
```

6. Start the development server:

```bash
npm run dev
```

Open `http://localhost:3000`.

## Demo credentials

- `admin` / `Milk@123`
- `manager` / `Milk@123`
- `employee` / `Milk@123`

## Useful scripts

- `npm run dev` - start the local app
- `npm run build` - production build
- `npm run lint` - ESLint
- `npm run db:push` - sync Prisma schema to PostgreSQL
- `npm run db:seed` - seed demo users, plans, employees, finance, and activity
- `npm run db:studio` - open Prisma Studio

## Project structure

```text
app/
  (auth)/login
  (app)/
    dashboard
    work-plans
    calendar
    employee-finance
    employees
    reports
    settings
  _actions/
components/
  calendar/
  employees/
  finance/
  forms/
  layout/
  ui/
  work-plans/
lib/
  auth/
prisma/
types/
```

## Deployment notes

- Set `DATABASE_URL` and `SESSION_SECRET` in Vercel environment variables.
- Run `npm run db:push` and `npm run db:seed` against your target database if you want demo data.
- Replace seeded development credentials before production use.

## Verification

- `npm run build`
- `npm run lint`
