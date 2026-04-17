# Project Audit — Nexora (digital-mania-growth)

⚠️ You asked to benchmark against an MVP POS system. This codebase is **not a POS** — it is an SMM (Social Media Marketing) panel: users top up a wallet via Stripe and purchase provider-backed engagement services (followers, likes…).  
I report against that actual domain; a POS-gap section is included at the end.

---

## 1. Project Overview

A wallet-based marketplace that resells a third-party SMM provider's services.

Users:
- Browse platforms → categories → services
- Fund wallet via Stripe Checkout
- Place orders (async to provider)
- Track order status

Admins:
- Manage users
- Manage services
- Sync provider

---

## 2. Tech Stack (detected)

| Layer | Detected |
|------|--------|
| Frontend | React 18, Vite, TypeScript, React Router v6, TanStack Query v5, Tailwind, shadcn/Radix, framer-motion, react-hook-form |
| Backend | NestJS 11, TypeScript, Passport (JWT), Joi, class-validator, argon2 |
| DB / ORM | PostgreSQL, Prisma 6 |
| Queue / Cache | BullMQ 5, Redis (ioredis), @bull-board/api |
| Payments | Stripe 18 (Checkout + webhook) |
| External | SMM provider (axios: services, add, status, cancel, refill, balance) |
| Infra | Docker, docker-compose, Pino logging |
| Test | Vitest, Playwright (frontend only) |

---

## 3. Architecture (actual)

- **Style:** Modular Monolith (NestJS modules)
- **Cross-cutting:** CommonModule (rate-limit, cache, logger, interceptors)
- **Async:** BullMQ queues
  - ORDER_SUBMIT_QUEUE
  - ORDER_STATUS_UPDATE_QUEUE
- **Auth:** JWT + refresh token (httpOnly cookie)
- **Frontend:** SPA (React)
- **Data integrity:** Wallet uses atomic updates (Serializable isolation)

---

## 4. Modules & Features

| Module | Capability | Status |
|--------|-----------|--------|
| Auth | Register, login, refresh, logout | ✅ Done |
| Users | User service, admin bootstrap | ✅ Done |
| Wallet | Balance + transactions | ✅ Done |
| Payments | Stripe checkout + webhook | ✅ Done |
| Platforms | List platforms | ✅ Done |
| Categories | List categories | ✅ Done |
| Services | Catalog browsing | ✅ Done |
| Orders | Create, list, cancel orders | ✅ Done |
| Provider | External API integration | ✅ Done |
| Admin | Manage users/services/orders | 🟡 Partial |
| Health | Health check | ✅ Done |
| Tickets | Support system | ❌ Missing |
| Refill | Provider refill logic | 🟡 Partial |
| Security | 2FA, email verification | ❌ Missing |
| Admin UI | Frontend admin panel | ❌ Missing |

---

## 5. Database Models (Prisma)

- User  
- Wallet  
- WalletTransaction  
- Payment  
- Platform  
- Category  
- Service  
- Order  
- OrderStatusLog  
- QueueJobLog  
- AdminActionLog  

❌ Missing:
- Ticket
- Notification
- Refund
- ApiKey

---

## 6. Gaps & Issues

### Technical
- ❌ Tickets module incomplete
- ❌ No refill endpoint exposed
- ❌ No admin frontend
- ⚠️ Transaction isolation inconsistent
- ⚠️ Order enqueue after commit (risk of lost jobs)
- ❌ No idempotency (orders/payments)
- ❌ No retries / circuit breaker
- ❌ No backend tests
- ⚠️ Logs grow unbounded
- ❌ bull-board not mounted
- ❌ No soft-delete for services

---

## 7. POS Gap (Important)

This is **NOT a POS system**.

Missing:
- Stock / inventory
- SKUs / barcodes
- Checkout system (cart)
- Payment at counter
- Receipts
- Tax rules
- Discounts
- Refund system
- Multi-store support
- Reporting (Z/X)
- Offline mode

---

# UML

## Use Case Diagram

```mermaid
flowchart LR
    Customer([Customer])
    Admin([Admin])
    Stripe([Stripe])
    Provider([Provider])

    UC1([Register / Login])
    UC2([Browse Services])
    UC3([Top-up Wallet])
    UC4([Place Order])
    UC5([Track Orders])
    UC6([Manage Users])
    UC7([Manage Services])
    UC8([Manage Orders])
    UC9([Webhook Payment])
    UC10([Process Orders])

    Customer --> UC1
    Customer --> UC2
    Customer --> UC3
    Customer --> UC4
    Customer --> UC5

    Admin --> UC6
    Admin --> UC7
    Admin --> UC8

    Stripe --> UC9
    Provider --> UC10
```

## Class diagram

```mermaid
classDiagram
    class User
    class Wallet
    class WalletTransaction
    class Payment
    class Platform
    class Category
    class Service
    class Order

    User --> Wallet
    Wallet --> WalletTransaction
    Wallet --> Payment
    User --> Order
    Service --> Order
    Platform --> Category
    Category --> Service
```

## Sequence Diagram 1 — Place Order

```mermaid
sequenceDiagram
    actor User
    participant API
    participant Service
    participant DB
    participant Wallet
    participant Queue
    participant Provider

    User->>API: POST /orders
    API->>Service: createOrder
    Service->>DB: create order
    Service->>Wallet: deduct
    Service->>Queue: add job
    Queue->>Provider: create order
    Provider->>DB: update status
```

## Sequence Diagram 2 — Stripe Payment
```mermaid
sequenceDiagram
    actor User
    participant Frontend
    participant API
    participant Stripe
    participant Wallet

    User->>Frontend: add funds
    Frontend->>API: create checkout
    API->>Stripe: create session
    Stripe->>API: webhook
    API->>Wallet: credit
```


## Sequence Diagram 3 — Cancel Order
```mermaid
sequenceDiagram
    actor User
    participant API
    participant Service
    participant Wallet
    participant Queue

    User->>API: cancel order
    API->>Service: cancel
    Service->>Wallet: refund
    Service->>Queue: remove job
```