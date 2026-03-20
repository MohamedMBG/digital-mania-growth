# Backend Architecture

## 1. Overview

The Nexora backend is constructed using **NestJS**, an enterprise-grade Node.js framework. The system embraces Object-Oriented Programming (OOP) principles, Dependency Injection (DI), and Domain-Driven Design (DDD) concepts by clustering specific features into isolated `Modules`.

**Core Stack:**
- **Framework:** NestJS 11
- **Language:** TypeScript
- **Database Access:** Prisma ORM
- **Background Tasks:** BullMQ & Redis

## 2. Module Boundaries

The backend architecture is intrinsically divided into feature modules hosted within `/backend/src`:

| Module | Responsibility |
|--------|----------------|
| **Auth** | Manages JWT issuance, Passport.js strategies, password hashing (Argon2), and login controllers. |
| **Users** | Handles user profile queries safely abstracted away from auth routines. |
| **Wallet** | Central controller for financial queries. Strictly ensures atomic behavior during balance reads and deductions. |
| **Payments** | Integrates with Stripe. Generates Checkout Sessions. Most critically, exposes and validates the Stripe Webhook handler to definitively credit wallets securely. |
| **Platforms / Categories / Services** | Classic CRUD abstractions exposing the catalog. Read-heavy. |
| **Orders** | Controls order placement. Orchestrates balance deductions and hooks into the Bull queue system. |
| **Provider** | An adapter layer. Receives standard internal payloads and formats them for outbound APIs (SMM panels) to deliver the service. |
| **Admin** | Isolated controllers injected with elevated Guards tracking administrative commands (updates catalogs, manages refunds) logging to `AdminActionLog`. |
| **Tickets** | Customer support routing. |
| **Health** | Infrastructure liveness and readiness probing. |

## 3. Asynchronous Execution Workflows

One of the platform's core tenants is instantaneous API responses. When a user submits an `Order`, they do not wait for the outbound SMM provider API to acknowledge the request natively.

### 3.1 SMM Order Delivery Workflow

```mermaid
sequenceDiagram
    actor User
    participant Frontend
    participant Orders API
    participant DB as Prisma (PostgreSQL)
    participant Queue as Redis (BullMQ)
    participant Worker as Background Processor
    participant Provider as SMM Provider API

    User->>Frontend: Places Order (Qty: 1000)
    Frontend->>Orders API: POST /orders
    Orders API->>DB: Check Wallet Balance
    DB-->>Orders API: Balance OK
    Orders API->>DB: Deduct Balance & Create Order (queued)
    Orders API->>Queue: Push Job {orderId}
    Orders API-->>Frontend: 201 Created (Instant)
    Frontend-->>User: Order Queued UI Update

    Queue-->>Worker: Next Job {orderId}
    Worker->>Provider: POST external API request
    Provider-->>Worker: 200 OK (provider_order_id)
    Worker->>DB: Update Order (processing) & Add OrderStatusLog
```

1. **Submission:** the `OrdersService` confirms funds, deducts the Wallet incrementally mapping to Prisma `$transaction`, and logs an `OrderStatus` of `queued`.
2. **Queuing:** A job containing the `OrderId` is pushed to the BullMQ Redis queue. The HTTP Request cleanly terminates with `201 Created`.
3. **Execution:** An isolated NestJS `@Processor()` intercepts the queued job asynchronously. 
4. **Adapter Execution:** The Processor utilizes the `ProviderService` to dial the external provider. Based on the 200/400 outbound response, the Processor logs a success/failure locally and advances the database `OrderStatusLog` (e.g., to `failed` initiating a refund, or `processing`).

## 4. Security & NestJS Request Lifecycle

NestJS operates on a precise execution lifecycle that ensures security and data sanitation before the Controller logic ever executes.

```mermaid
flowchart LR
    A[Client Request] --> B(Middleware)
    B --> C(Guards: Auth / RBAC)
    C --> D(Interceptors: Pre-Controller)
    D --> E(Pipes: Validation & Transform)
    E --> F[Controller Route Handler]
    F --> G[(Service Layer / Prisma)]
```

- **Guards:** API endpoints are locked dynamically using custom Guards (e.g. `@UseGuards(JwtAuthGuard, RolesGuard)`).
- **Pipes:** The system heavily utilizes NestJS **Validation Pipes** bounded to `class-validator`/`class-transformer`. Incoming JSON payload strings are meticulously transformed into real instantiated JS Classes and validated against business rules (e.g. string lengths, UUID validations) before hitting the Controller.

## 5. Stripe Webhook & Wallet Top-up Flow

Wallet funding must be flawlessly atomic to prevent double-spending or lost deposits.

```mermaid
sequenceDiagram
    actor Client
    participant Frontend
    participant Payment API
    participant Stripe Provider
    participant Webhook API
    participant DB

    Client->>Frontend: Request Deposit ($50)
    Frontend->>Payment API: POST /payments/create-intent
    Payment API->>Stripe Provider: Construct Checkout Session
    Stripe Provider-->>Payment API: Session URL
    Payment API-->>Frontend: 201 Redirect URL
    Frontend-->>Client: Redirects to Stripe Checkout Hosted UI

    Client->>Stripe Provider: Enters Credit Card & Pays
    Stripe Provider-->>Client: Reroutes to platform /success

    Note over Stripe Provider, Webhook API: Asynchronous Webhook execution (critically secure)
    Stripe Provider->>Webhook API: POST /payments/webhook (checkout.session.completed)
    Webhook API->>Webhook API: Validate Stripe Signature Secret
    Webhook API->>DB: Check if Payment Intent already processed
    DB-->>Webhook API: Not processed
    Webhook API->>DB: Transaction: Create WalletTransaction (Deposit) & Update Wallet Balance
    Webhook API-->>Stripe Provider: 200 OK (Acknowledged)
```
