# Nexora

Nexora is a React and NestJS platform for service discovery, wallet funding, campaign ordering, and provider-backed order processing.

## Stack

- Frontend: Vite, React, TypeScript, Tailwind
- Backend: NestJS, Prisma, PostgreSQL, Redis, BullMQ
- Payments: Stripe Checkout with webhook verification

## Local Development

### Frontend

```sh
npm install
npm run dev
```

### Backend

Run from [`backend`](/c:/Users/pc/projectw/digital-mania-growth/backend):

```sh
npm install
npm run prisma:generate
npm run prisma:deploy
npm run prisma:seed
npm run start:dev
```

## Environment Files

- Frontend example: [`.env.example`](/c:/Users/pc/projectw/digital-mania-growth/.env.example)
- Backend example: [`backend/.env.example`](/c:/Users/pc/projectw/digital-mania-growth/backend/.env.example)

## Deployment

See [DEPLOYMENT.md](/c:/Users/pc/projectw/digital-mania-growth/DEPLOYMENT.md) for production variables, infrastructure requirements, Prisma commands, and deployment verification steps.
