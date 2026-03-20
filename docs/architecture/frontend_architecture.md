# Frontend Architecture

## 1. Overview

The Nexora frontend is built as a highly reactive Single Page Application (SPA). It favors strict typing, atomic component structures, and declarative data synchronization.

**Core Stack:**
- **Framework:** React 18
- **Build Tool / Bundler:** Vite
- **Language:** TypeScript
- **Styling Strategy:** Tailwind CSS + Radix/shadcn UI Primitives

## 2. System Structure

```
src/
├── components/      # Reusable UI elements
│   ├── ui/          # Standardized atoms (Buttons, Inputs, Dialogs via shadcn)
│   └── ...          # Composite elements (BrandLogo, Header, Footer, RequireAuth)
├── data/            # Static constants / Mock services abstractions
├── hooks/           # Custom React hooks
├── lib/             # Utility toolkits (Tailwind merge wrappers, formatters)
└── pages/           # High-level route views (Dashboard, Order, AddFunds)
```

### 2.1 Component Hierarchy Diagram

```mermaid
graph TD
    App[App Router]
    AuthGuard[RequireAuth Guard]
    Layout[Dashboard Layout]
    Pages{Pages}
    Dashboard[Dashboard Page]
    Order[Order Page]
    Wallet[Add Funds Page]
    Shared[Shared Components]
    QueryClient[React Query Client]

    App --> QueryClient
    QueryClient --> AuthGuard
    AuthGuard -->|Authenticated| Layout
    AuthGuard -->|Unauthenticated| Login[Login Page]
    Layout --> Pages
    Pages --> Dashboard
    Pages --> Order
    Pages --> Wallet
    Pages -.-> Shared
    Shared -.-> shadcn[shadcn/ui Primitives]
```

## 3. Key Paradigms

### 3.1 Styling & UI Library
The platform utilizes **shadcn/ui**. Unlike traditional component libraries (like MUI or AntDesign), shadcn provides the raw code of the components directly into the `src/components/ui` folder. This gives complete structural ownership.
- **Tailwind CSS** handles the atomic styling, driven by a centralized `tailwind.config.ts`.
- `clsx` and `tailwind-merge` are utilized to gracefully compose and override conditional CSS classes.

### 3.2 Data Fetching & State Synchronization

The application establishes a clear boundary between Server State (persisted data) and Client State (UI layout, toggles).

```mermaid
sequenceDiagram
    participant Component as React Component
    participant Hook as useQuery (React Query)
    participant Cache as Query Cache
    participant Api as Axios/Fetch Client
    participant Server as NestJS API

    Component->>Hook: Mounts & Calls useQuery(['services'])
    Hook->>Cache: Check for cached 'services'
    alt Cache Hit (Fresh)
        Cache-->>Hook: Return instant data
        Hook-->>Component: Render with data
    else Cache Miss / Stale
        alt Cache Hit (Stale)
            Cache-->>Hook: Return stale data (background refetch)
            Hook-->>Component: Render stale data instantly
        end
        Hook->>Api: Fetch GET /services
        Api->>Server: HTTP Request
        Server-->>Api: JSON Data
        Api-->>Cache: Update cache & Timestamp
        Cache-->>Hook: Return fresh data
        Hook-->>Component: Re-render with new data
    end
```

- **React Query (Server State):** Manages asynchronous remote state. It handles caching, deduplication, and background refetching automatically. Queries are strictly keyed (e.g., `['user', 'wallet']`) allowing precise cache invalidations without full page reloads.
- **Local State (Client State):** Handled natively via `useState` or Context API for extremely localized transient state (e.g., modal visibility, form multi-step indices).
- **Forms & Validation:** Handled exclusively via `react-hook-form` connected to `zod` schema resolvers. This ensures zero uncontrolled re-renders and strictly typed validation structures propagating right back to the API.

### 3.3 Routing Strategy
Managed via `react-router-dom` using declarative `<Route>` structures.
- **Authentication Guards:** The `<RequireAuth>` wrapper component securely wraps private dashboards. It verifies session contexts before rendering the sub-tree, otherwise triggering an immediate redirect to `/login`.

### 3.4 Animations
Micro-interactions are governed by `framer-motion` (`motion.div`), providing fluid spring physics to dialog opens, page transitions, and toast notifications without dropping frames.
