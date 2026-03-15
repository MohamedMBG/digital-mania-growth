# Deployment Guide

## Frontend Environment

Create a frontend `.env` file from [`.env.example`](/c:/Users/pc/projectw/digital-mania-growth/.env.example):

```env
VITE_API_URL=https://api.your-domain.com/api
```

## Backend Environment

Start from [`backend/.env.example`](/c:/Users/pc/projectw/digital-mania-growth/backend/.env.example) and set production values:

```env
NODE_ENV=production
PORT=4000
API_PREFIX=api
FRONTEND_URL=https://your-domain.com

DATABASE_URL=postgresql://USER:PASSWORD@HOST:5432/DB_NAME?schema=public

REDIS_HOST=your-redis-host
REDIS_PORT=6379
REDIS_USERNAME=
REDIS_PASSWORD=your-redis-password
REDIS_DB=0

JWT_ACCESS_SECRET=replace-with-a-long-random-secret
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_SECRET=replace-with-a-long-random-refresh-secret
JWT_REFRESH_EXPIRES_IN=7d

STRIPE_SECRET_KEY=sk_live_or_test_key
STRIPE_WEBHOOK_SECRET=whsec_from_stripe
STRIPE_CURRENCY=usd
STRIPE_CHECKOUT_SUCCESS_URL=https://your-domain.com/wallet/success
STRIPE_CHECKOUT_CANCEL_URL=https://your-domain.com/wallet/cancel

PROVIDER_URL=https://your-provider.example/api/v2
PROVIDER_API_KEY=your-provider-api-key

LOG_LEVEL=warn
BULLMQ_PREFIX=nexora
```

Rotate every secret that has ever been committed or shared.

## Infrastructure Checklist

- Frontend host: Vercel or Netlify
- Backend host: Render, Railway, or another Node host
- Postgres: Supabase, Neon, or managed Postgres
- Redis: Upstash or managed Redis
- Stripe webhook: point to `POST https://api.your-domain.com/api/payments/webhook`

## Deploy Order

1. Provision Postgres and Redis.
2. Set backend environment variables.
3. Run Prisma migration deployment.
4. Seed the catalog data.
5. Deploy the backend.
6. Configure the Stripe webhook endpoint and copy the webhook secret.
7. Set the frontend `VITE_API_URL`.
8. Deploy the frontend.
9. Verify the full payment and order flows.

## Prisma Commands

Run from [`backend`](/c:/Users/pc/projectw/digital-mania-growth/backend):

```sh
npm install
npm run prisma:generate
npm run prisma:deploy
npm run prisma:seed
npm run build
npm run start:prod
```

## Verification Checklist

- Register a new customer account
- Log in and confirm `/auth/me` succeeds
- Create a Stripe checkout session
- Complete payment and confirm webhook delivery
- Confirm wallet balance increases only after webhook verification
- Create an order
- Confirm queue submission and status updates
- Cancel an eligible order and confirm only one refund is created
- Refresh the dashboard and verify wallet, orders, and payments are in sync
