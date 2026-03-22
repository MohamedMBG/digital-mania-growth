# API Integration Guide

This document explains how to connect the existing frontend to the Digital Mania backend.

## Base URL

Use the backend API prefix configured in the environment.

```text
http://localhost:4000/api
```

Example:

```text
GET http://localhost:4000/api/services
```

## Common Conventions

- `Content-Type: application/json`
- Protected routes require `Authorization: Bearer <accessToken>`
- Pagination is returned with a `meta` object
- Successful responses use a consistent `success/message/data` shape
- Errors come from the global exception filter in a consistent JSON format

## Success Response Format

```json
{
  "success": true,
  "message": "Operation completed successfully.",
  "data": {},
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 100,
    "totalPages": 5,
    "hasNextPage": true,
    "hasPreviousPage": false
  }
}
```

Notes:

- `meta` is only present on paginated list endpoints
- `data` may be an object, array, or `null`

## Error Response Format

```json
{
  "statusCode": 400,
  "message": "Invalid email or password.",
  "timestamp": "2026-03-14T12:00:00.000Z",
  "path": "/api/auth/login"
}
```

Recommended frontend handling:

- `400`: validation or business-rule error
- `401`: session expired or invalid token
- `403`: insufficient permissions
- `404`: resource not found
- `409`: duplicate/conflict case
- `500`: unexpected server error

## Authentication Flow

The backend currently uses a bearer-token flow.

### Login/Register Flow

1. Call `POST /auth/register` or `POST /auth/login`
2. Save:
   - `accessToken`
   - `refreshToken`
   - `user`
3. Send the `accessToken` in the `Authorization` header for protected routes
4. If a request returns `401`, call `POST /auth/refresh`
5. Replace stored tokens and retry the failed request
6. On logout, call `POST /auth/logout` and clear local auth state

### Why This Works Well With the Existing Frontend

- easy to plug into axios interceptors
- no frontend page changes are required
- no cookie parsing is needed

### Future Option

If you want stricter production security later, the refresh token can be moved to an `HttpOnly`, `Secure`, `SameSite` cookie while keeping the rest of the backend auth logic mostly the same.

## Axios Integration Example

```ts
import axios from "axios";

export const api = axios.create({
  baseURL: "http://localhost:4000/api",
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: false,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("accessToken");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});
```

### Refresh Token Helper

```ts
export async function refreshSession() {
  const refreshToken = localStorage.getItem("refreshToken");

  const response = await api.post("/auth/refresh", {
    refreshToken,
  });

  const tokens = response.data.data.tokens;

  localStorage.setItem("accessToken", tokens.accessToken);
  localStorage.setItem("refreshToken", tokens.refreshToken);

  return tokens.accessToken;
}
```

### Axios 401 Retry Interceptor

```ts
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      const newAccessToken = await refreshSession();
      originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;

      return api(originalRequest);
    }

    return Promise.reject(error);
  }
);
```

### Error Message Helper

```ts
export function getApiErrorMessage(error: any) {
  return (
    error?.response?.data?.message ||
    error?.message ||
    "Something went wrong"
  );
}
```

## CORS Configuration

The backend already supports frontend integration through environment-driven CORS.

Set this in `backend/.env`:

```env
FRONTEND_URL=http://localhost:8080
```

For multiple frontend origins:

```env
FRONTEND_URL=http://localhost:8080,https://yourdomain.com
```

The backend CORS config supports:

- allowed origins from `FRONTEND_URL`
- `Authorization` header
- `Content-Type` header
- `credentials: true`

## Auth API

### Register

`POST /auth/register`

Request:

```json
{
  "email": "user@example.com",
  "password": "StrongPass123",
  "fullName": "Jane Doe"
}
```

Response:

```json
{
  "success": true,
  "message": "Authentication successful.",
  "data": {
    "user": {
      "id": "clx123",
      "email": "user@example.com",
      "fullName": "Jane Doe",
      "role": "customer",
      "provider": "email",
      "isActive": true,
      "createdAt": "2026-03-14T12:00:00.000Z",
      "updatedAt": "2026-03-14T12:00:00.000Z"
    },
    "tokens": {
      "accessToken": "jwt-access-token",
      "refreshToken": "jwt-refresh-token",
      "tokenType": "Bearer",
      "expiresIn": "15m",
      "refreshExpiresIn": "7d"
    }
  }
}
```

### Login

`POST /auth/login`

Request:

```json
{
  "email": "user@example.com",
  "password": "StrongPass123"
}
```

Response shape is the same as register.

### Refresh

`POST /auth/refresh`

Request:

```json
{
  "refreshToken": "jwt-refresh-token"
}
```

### Logout

`POST /auth/logout`

Headers:

```text
Authorization: Bearer <accessToken>
```

Response:

```json
{
  "success": true,
  "message": "Logged out successfully.",
  "data": null
}
```

### Current User

`GET /auth/me`

Headers:

```text
Authorization: Bearer <accessToken>
```

Response:

```json
{
  "success": true,
  "message": "Authenticated user loaded successfully.",
  "data": {
    "user": {
      "id": "clx123",
      "email": "user@example.com",
      "fullName": "Jane Doe",
      "role": "customer",
      "provider": "email",
      "isActive": true,
      "createdAt": "2026-03-14T12:00:00.000Z",
      "updatedAt": "2026-03-14T12:00:00.000Z"
    }
  }
}
```

## Catalog API

### Platforms

`GET /platforms`

Response:

```json
{
  "success": true,
  "message": "Platforms loaded successfully.",
  "data": [
    {
      "id": "plt_1",
      "name": "Instagram",
      "slug": "instagram",
      "description": "Instagram growth services",
      "icon": "instagram",
      "sortOrder": 1
    }
  ]
}
```

### Categories

`GET /categories?platformSlug=instagram`

### Services

`GET /services?platformSlug=instagram&categorySlug=followers&page=1&limit=12`

Example service object:

```json
{
  "id": "svc_1",
  "name": "Instagram Followers",
  "slug": "instagram-followers",
  "description": "High-quality followers",
  "shortDescription": "Fast delivery",
  "pricePerK": 4.99,
  "minOrder": 100,
  "maxOrder": 100000,
  "deliverySpeed": "0-2 hours",
  "guarantee": "30-day guarantee",
  "refillPolicy": "Auto-refill",
  "isFeatured": true,
  "isActive": true,
  "sortOrder": 1,
  "createdAt": "2026-03-14T12:00:00.000Z",
  "updatedAt": "2026-03-14T12:00:00.000Z",
  "platform": {
    "id": "plt_1",
    "name": "Instagram",
    "slug": "instagram",
    "icon": "instagram"
  },
  "category": {
    "id": "cat_1",
    "name": "Followers",
    "slug": "followers"
  }
}
```

### Featured Services

`GET /services/featured?page=1&limit=6`

### Service Details

`GET /services/:slug`

## Wallet API

### Wallet Balance

`GET /wallet`

Headers:

```text
Authorization: Bearer <accessToken>
```

Response:

```json
{
  "success": true,
  "message": "Wallet loaded successfully.",
  "data": {
    "id": "wal_1",
    "userId": "usr_1",
    "balance": 125.5,
    "currency": "USD",
    "transactionCount": 12,
    "createdAt": "2026-03-14T12:00:00.000Z",
    "updatedAt": "2026-03-14T12:00:00.000Z"
  }
}
```

### Wallet Transactions

`GET /wallet/transactions?page=1&limit=20&type=deposit`

## Payments API

### Create Stripe Checkout Session

`POST /payments/checkout`

Headers:

```text
Authorization: Bearer <accessToken>
```

Request:

```json
{
  "amount": 50,
  "currency": "usd"
}
```

Response:

```json
{
  "success": true,
  "message": "Checkout session created successfully.",
  "data": {
    "checkoutSessionId": "cs_test_123",
    "url": "https://checkout.stripe.com/...",
    "amount": 50,
    "currency": "usd",
    "status": "pending"
  }
}
```

Important:

- the frontend must redirect the user to the returned Stripe URL
- the frontend must never trust redirect success as payment success
- wallet credit is only applied after a verified Stripe webhook

### Payment History

`GET /payments/history?page=1&limit=20`

Headers:

```text
Authorization: Bearer <accessToken>
```

## Orders API

### Create Order

`POST /orders`

Headers:

```text
Authorization: Bearer <accessToken>
```

Request:

```json
{
  "serviceId": "svc_1",
  "quantity": 1000,
  "targetUrl": "https://instagram.com/example",
  "notes": "Optional note"
}
```

Response:

```json
{
  "success": true,
  "message": "Order created successfully.",
  "data": {
    "id": "ord_1",
    "quantity": 1000,
    "chargeAmount": 4.99,
    "currency": "USD",
    "targetUrl": "https://instagram.com/example",
    "status": "queued",
    "providerServiceId": "1001",
    "providerOrderId": null,
    "startCount": null,
    "remains": 1000,
    "notes": "Optional note",
    "canceledAt": null,
    "createdAt": "2026-03-14T12:00:00.000Z",
    "updatedAt": "2026-03-14T12:00:00.000Z",
    "service": {
      "id": "svc_1",
      "name": "Instagram Followers",
      "slug": "instagram-followers",
      "platform": {
        "name": "Instagram",
        "slug": "instagram"
      },
      "category": {
        "name": "Followers",
        "slug": "followers"
      }
    },
    "statusLogs": [
      {
        "id": "log_1",
        "status": "pending",
        "message": "Order created and awaiting provider queue dispatch.",
        "metadata": {},
        "createdAt": "2026-03-14T12:00:00.000Z"
      }
    ]
  }
}
```

### List Orders

`GET /orders?page=1&limit=20&status=processing`

### Order Details

`GET /orders/:id`

### Cancel Order

`PATCH /orders/:id/cancel`

## Admin API

All admin endpoints require:

- authenticated user
- `role === "admin"`

### Users

`GET /admin/users?page=1&limit=20`

### Orders

`GET /admin/orders?page=1&limit=20`

### Payments

`GET /admin/payments?page=1&limit=20`

### Create Service

`POST /admin/services`

Request:

```json
{
  "platformId": "plt_1",
  "categoryId": "cat_1",
  "name": "Instagram Followers",
  "slug": "instagram-followers",
  "providerServiceId": "1001",
  "description": "High-quality followers",
  "shortDescription": "Fast delivery",
  "pricePerK": 4.99,
  "minOrder": 100,
  "maxOrder": 100000,
  "deliverySpeed": "0-2 hours",
  "guarantee": "30-day guarantee",
  "refillPolicy": "Auto-refill",
  "isFeatured": true,
  "isActive": true,
  "sortOrder": 1
}
```

### Update Service

`PATCH /admin/services/:id`

### Sync Provider Services

`POST /admin/providers/sync-services`

Important:

- this sync updates existing local services when it can match them
- unmatched provider services are returned in the response
- it does not guess `platformId` or `categoryId`

### Provider Balance

`GET /admin/providers/balance`

### Update Order

`PATCH /admin/orders/:id`

Example:

```json
{
  "status": "processing",
  "startCount": 100,
  "remains": 900,
  "providerOrderId": "554433"
}
```

### Wallet Adjustment

`POST /admin/wallet-adjustments`

Request:

```json
{
  "userId": "usr_1",
  "amount": 25,
  "type": "adjustment",
  "description": "Manual admin credit"
}
```

## Suggested Frontend API Structure

A clean frontend service split would look like this:

- `authApi.ts`
- `catalogApi.ts`
- `walletApi.ts`
- `paymentsApi.ts`
- `ordersApi.ts`
- `adminApi.ts`

Example:

```ts
export async function getServices(params?: Record<string, string | number>) {
  const response = await api.get("/services", { params });
  return response.data;
}

export async function createOrder(payload: {
  serviceId: string;
  quantity: number;
  targetUrl: string;
  notes?: string;
}) {
  const response = await api.post("/orders", payload);
  return response.data;
}
```

## Final Integration Notes

- use `accessToken` for all protected requests
- refresh tokens on `401`
- never trust frontend-only payment success
- show backend `message` values directly when useful
- consume list responses with `data` + `meta`
- consume detail responses with `data`

## Local File References

Relevant backend files:

- [main.ts](C:/Users/pc/projectw/digital-mania-growth/backend/src/main.ts)
- [config.module.ts](C:/Users/pc/projectw/digital-mania-growth/backend/src/config/config.module.ts)
- [global-exception.filter.ts](C:/Users/pc/projectw/digital-mania-growth/backend/src/common/filters/global-exception.filter.ts)
- [auth.controller.ts](C:/Users/pc/projectw/digital-mania-growth/backend/src/auth/auth.controller.ts)
- [wallet.controller.ts](C:/Users/pc/projectw/digital-mania-growth/backend/src/wallet/wallet.controller.ts)
- [payments.controller.ts](C:/Users/pc/projectw/digital-mania-growth/backend/src/payments/payments.controller.ts)
- [orders.controller.ts](C:/Users/pc/projectw/digital-mania-growth/backend/src/orders/orders.controller.ts)
- [admin.controller.ts](C:/Users/pc/projectw/digital-mania-growth/backend/src/admin/admin.controller.ts)
