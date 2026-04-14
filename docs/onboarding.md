# Developer Onboarding

## What This Repo Is

This repository contains a two-part TypeScript application:

- A Vite + React frontend at the repository root.
- A NestJS backend API in `backend/`.

The product domain is a wallet-backed marketplace for social growth services. Users can:

- browse service catalog data,
- create an account and log in,
- fund a wallet with Stripe Checkout,
- place orders against wallet balance,
- track provider fulfillment over time.

## Repo Layout

```text
.
├─ src/                      Frontend SPA
│  ├─ pages/                 Route-level screens
│  ├─ components/            Shared UI and auth guard
│  ├─ context/               Session/auth state
│  ├─ lib/                   API client and utilities
│  ├─ data/                  Fallback catalog content
│  └─ test/                  Vitest setup
├─ docs/                     Product and architecture docs
├─ backend/                  NestJS API
│  ├─ src/                   Feature modules + shared infrastructure
│  ├─ prisma/                Prisma schema and seed data
│  ├─ Dockerfile             Backend container image
│  └─ docker-compose.yml     Local Postgres + Redis + backend stack
└─ package.json              Frontend scripts
```

## Prerequisites

- Node.js 22-compatible environment
- npm
- PostgreSQL
- Redis
- Stripe test credentials
- External provider credentials for real order submission

If you only need to explore the UI, the frontend can still render with fallback catalog data from `src/data/services.ts`.

## Local Setup

### 1. Frontend

Create `.env` from `.env.example`:

```env
VITE_API_URL=http://localhost:4000/api
```

Install and run from the repo root:

```sh
npm install
npm run dev
```

Frontend default dev host is configured in `vite.config.ts` to run on port `8080`.

### 2. Backend

Create `backend/.env` from `backend/.env.example`.

Minimum local values:

```env
NODE_ENV=development
PORT=4000
API_PREFIX=api
FRONTEND_URL=http://localhost:8080
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/nexora?schema=public
REDIS_HOST=localhost
REDIS_PORT=6379
JWT_ACCESS_SECRET=replace-with-a-long-random-secret
JWT_REFRESH_SECRET=replace-with-a-long-random-refresh-secret
STRIPE_SECRET_KEY=sk_test_change_me
STRIPE_WEBHOOK_SECRET=whsec_change_me
PROVIDER_URL=https://example-provider.com/api/v2
PROVIDER_API_KEY=replace-with-provider-api-key
```

Then run from `backend/`:

```sh
npm install
npm run prisma:generate
npm run prisma:deploy
npm run prisma:seed
npm run start:dev
```

### 3. Optional Docker Workflow

The backend ships with `backend/docker-compose.yml`, which provisions:

- `app`
- `postgres`
- `redis`

That file is useful when you want the backend dependencies together, but the frontend is still run from the repo root.

## Where the App Starts

### Frontend

- `src/main.tsx`: renders the React app.
- `src/App.tsx`: wraps providers and declares routes.
- `src/context/AuthContext.tsx`: restores session and exposes login/register/logout helpers.
- `src/lib/api.ts`: shared fetch wrapper with token refresh behavior.

### Backend

- `backend/src/main.ts`: bootstraps Nest, CORS, validation, security headers, and the global exception filter.
- `backend/src/app.module.ts`: top-level composition root importing all backend modules.
- `backend/prisma/schema.prisma`: persistence model.
- `backend/prisma/seed.ts`: local catalog seed data.

## First Files To Read

Read these in order if you are new to the codebase:

1. `src/App.tsx`
2. `src/context/AuthContext.tsx`
3. `src/lib/api.ts`
4. `src/pages/Services.tsx`
5. `src/pages/ServiceDetails.tsx`
6. `src/pages/Order.tsx`
7. `src/pages/AddFunds.tsx`
8. `backend/src/main.ts`
9. `backend/src/app.module.ts`
10. `backend/prisma/schema.prisma`
11. `backend/src/orders/orders.service.ts`
12. `backend/src/payments/payments.service.ts`
13. `backend/src/wallet/wallet.service.ts`
14. `backend/src/orders/orders-submit.processor.ts`
15. `backend/src/orders/orders-status-update.processor.ts`

## Main Runtime Flows

### Catalog Browse

- Frontend pages call `/platforms`, `/categories`, and `/services`.
- Backend catalog services are cached in Redis through `CacheService`.
- The frontend falls back to local catalog data if the API is unavailable.

### Authentication

- `AuthContext` stores `user`, `accessToken`, and `refreshToken` in localStorage under `nexora-session`.
- Protected routes are enforced by `src/components/RequireAuth.tsx`.
- The backend issues JWT access and refresh tokens from `backend/src/auth/auth.service.ts`.

### Wallet Funding

- `src/pages/AddFunds.tsx` posts to `/payments/checkout`.
- The backend creates a Stripe Checkout session and stores a pending `Payment` record.
- Stripe calls `/payments/webhook`.
- The wallet is credited only after webhook verification succeeds.

### Order Placement

- `src/pages/ServiceDetails.tsx` stores a draft order in localStorage under `nexora-order-draft`.
- `src/pages/Order.tsx` submits to `/orders`.
- `OrdersService` validates service constraints, deducts wallet funds, creates the order, and enqueues background work.
- BullMQ processors submit the order to the external provider, then poll status updates.

## Backend Module Guide

### Business modules

- `auth`: register, login, refresh, logout, current user
- `users`: persistence helpers for user entities
- `wallet`: wallet reads and immutable wallet transaction ledger writes
- `payments`: Stripe Checkout, Stripe webhook handling, payment history
- `orders`: order creation, listing, cancellation, queue handoff
- `provider`: adapter around the external provider API
- `platforms`, `categories`, `services`: public catalog APIs
- `admin`: privileged catalog/order/wallet operations and provider sync
- `health`: Postgres and Redis health check

### Shared infrastructure

- `common`: logger, cache, rate limiting, exception filter, interceptor
- `config`: env loading and Joi validation
- `prisma`: Prisma client wiring
- `infrastructure/redis`: shared Redis connection
- `infrastructure/queue`: BullMQ root config

## Frontend Guide

The frontend is route-driven and currently favors direct page-level fetching over a dedicated domain hook layer.

Key routes:

- `/`: marketing landing page
- `/services`: catalog browse page
- `/services/:id`: service details and order draft creation
- `/dashboard`: wallet, recent orders, recent payments
- `/order`: authenticated wallet-backed checkout page
- `/add-funds`: Stripe top-up page
- `/wallet/success`: post-checkout success info page
- `/wallet/cancel`: canceled checkout info page
- `/login` and `/register`

## Important Architectural Behaviors

- React Query is wired at the app root, but most pages still fetch with `useEffect` and `apiRequest` directly.
- Wallet balance mutations are done server-side only.
- Wallet debits use guarded updates to prevent overdrafts under concurrent requests.
- Stripe wallet crediting is idempotent through the `creditedAt` check in `PaymentsService`.
- Catalog reads are cached in Redis, but admin writes do not proactively invalidate cache keys.
- `backend/src/tickets/` exists only as a placeholder right now and is not wired into `AppModule`.

## Testing And Verification

### Frontend

- `npm test` runs Vitest.
- `npm run build` runs Vite build.

### Backend

- `npm run build` compiles successfully with Nest.
- Prisma commands generate, migrate, and seed the database.

### Current state observed during analysis

- Backend build completed successfully.
- Frontend build and Vitest startup were blocked in this environment by an `esbuild` `spawn EPERM` issue, so frontend tooling is configured but was not fully verified here.

## Good First Tasks For A New Contributor

- Replace page-level data fetching with `useQuery` and `useMutation` patterns.
- Add cache invalidation for catalog-related admin writes.
- Add real backend tests for orders, wallet, and Stripe webhook idempotency.
- Add a dedicated worker deployment entry if API and workers need to scale independently.
- Either complete or remove the placeholder `tickets` area.
