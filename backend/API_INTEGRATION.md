Use this as the integration contract between your existing frontend and the backend.

**Base**
- Base URL: `http://localhost:4000/api`
- Auth: `Authorization: Bearer <accessToken>`
- Refresh: `POST /auth/refresh` with `refreshToken`
- Content-Type: `application/json`

**Response Shape**
Success:
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

Error:
```json
{
  "statusCode": 400,
  "message": "Invalid email or password.",
  "timestamp": "2026-03-14T12:00:00.000Z",
  "path": "/api/auth/login"
}
```

**Auth Flow**
1. `POST /auth/register` or `POST /auth/login`
2. Store:
   - `accessToken` in memory or secure storage
   - `refreshToken` in secure storage
3. Send `accessToken` on protected requests
4. On `401`, call `POST /auth/refresh`
5. Replace tokens and retry request
6. On logout, call `POST /auth/logout` and clear local auth state

Bearer-token flow is what the backend currently supports best for your frontend. If later you want stricter security, refresh token can move to `HttpOnly` cookie.

**Axios Setup**
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

Refresh example:
```ts
export async function refreshSession() {
  const refreshToken = localStorage.getItem("refreshToken");

  const { data } = await api.post("/auth/refresh", { refreshToken });

  localStorage.setItem("accessToken", data.data.tokens.accessToken);
  localStorage.setItem("refreshToken", data.data.tokens.refreshToken);

  return data.data.tokens.accessToken;
}
```

Response retry example:
```ts
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config;

    if (error.response?.status === 401 && !original._retry) {
      original._retry = true;
      const newAccessToken = await refreshSession();
      original.headers.Authorization = `Bearer ${newAccessToken}`;
      return api(original);
    }

    return Promise.reject(error);
  }
);
```

**Auth Examples**
Register:
```json
POST /auth/register
{
  "email": "user@example.com",
  "password": "StrongPass123",
  "fullName": "Jane Doe"
}
```

Login response:
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
      "accessToken": "jwt-access",
      "refreshToken": "jwt-refresh",
      "tokenType": "Bearer",
      "expiresIn": "15m",
      "refreshExpiresIn": "7d"
    }
  }
}
```

Current user:
```json
GET /auth/me
Authorization: Bearer <token>
```

**Catalog**
Platforms:
```json
GET /platforms
```

Services with filters:
```json
GET /services?platformSlug=instagram&categorySlug=followers&page=1&limit=12
```

Service item:
```json
{
  "id": "svc_1",
  "name": "Instagram Followers",
  "slug": "instagram-followers",
  "pricePerK": 4.99,
  "minOrder": 100,
  "maxOrder": 100000,
  "platform": {
    "name": "Instagram",
    "slug": "instagram"
  },
  "category": {
    "name": "Followers",
    "slug": "followers"
  }
}
```

**Wallet**
Wallet:
```json
GET /wallet
Authorization: Bearer <token>
```

Transactions:
```json
GET /wallet/transactions?page=1&limit=20&type=deposit
Authorization: Bearer <token>
```

**Payments**
Create checkout:
```json
POST /payments/checkout
Authorization: Bearer <token>

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

History:
```json
GET /payments/history?page=1&limit=20
Authorization: Bearer <token>
```

**Orders**
Create:
```json
POST /orders
Authorization: Bearer <token>

{
  "serviceId": "svc_1",
  "quantity": 1000,
  "targetUrl": "https://instagram.com/example",
  "notes": "optional"
}
```

List:
```json
GET /orders?page=1&limit=20&status=processing
Authorization: Bearer <token>
```

Cancel:
```json
PATCH /orders/:id/cancel
Authorization: Bearer <token>
```

**Tickets**
Create:
```json
POST /tickets
Authorization: Bearer <token>

{
  "subject": "Order delay",
  "message": "My order is still pending."
}
```

Reply:
```json
POST /tickets/:id/messages
Authorization: Bearer <token>

{
  "message": "Any update on this?"
}
```

Close:
```json
PATCH /tickets/:id/close
Authorization: Bearer <token>
```

**Admin**
Use only when `user.role === "admin"`.

Examples:
```json
GET /admin/users?page=1&limit=20
GET /admin/orders?page=1&limit=20
GET /admin/payments?page=1&limit=20
POST /admin/providers/sync-services
GET /admin/providers/balance
```

Wallet adjustment:
```json
POST /admin/wallet-adjustments
Authorization: Bearer <token>

{
  "userId": "clx123",
  "amount": 25,
  "type": "adjustment",
  "description": "Manual credit"
}
```

**CORS**
Your backend already supports frontend integration through:
- origin allowlist from `FRONTEND_URL`
- `Authorization` header
- `credentials: true`

For local dev set in [backend/.env](C:/Users/pc/projectw/digital-mania-growth/backend/.env):
```env
FRONTEND_URL=http://localhost:8080
```

For multiple frontend origins:
```env
FRONTEND_URL=http://localhost:8080,https://yourdomain.com
```

**Frontend Error Handling**
Recommended frontend mapping:
- `400`: validation/business rule error
- `401`: access token expired/invalid, try refresh
- `403`: user lacks permission
- `404`: resource missing
- `409`: duplicate/conflict
- `500`: server issue

Example helper:
```ts
export function getApiErrorMessage(error: any) {
  return (
    error?.response?.data?.message ||
    error?.message ||
    "Something went wrong"
  );
}
```

