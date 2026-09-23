# Crumb & Joy Architecture

## Overview

Crumb & Joy is a React 19 + Vite bakery prototype built with TypeScript and Tailwind CSS v4. It provides two in-memory experiences:

- Customer shopping: browse products, search, manage a cart, apply promo codes, view a profile, use subscriptions, and chat with a rule-based concierge.
- Admin/franchise operations: place bulk ingredient orders, inspect inventory, and view analytics.

The application is currently a front-end demo. It does not have a backend, database, server-side authentication, payment processor, order service, inventory service, or AI service.

## File Purposes

### Repository and tooling

| File | Purpose |
| --- | --- |
| `index.html` | Vite HTML shell. Provides the `#root` mount point and loads `src/main.tsx`; its title and language placeholders are populated by the Figma Vite plugin. |
| `package.json` | Project metadata, runtime/development dependencies, and `dev`, `build`, `preview`, and `format` scripts. |
| `package-lock.json` | npm dependency lockfile. |
| `pnpm-lock.yaml` | pnpm dependency lockfile. Keeping both lockfiles can produce different dependency resolutions; standardize on one package manager. |
| `tsconfig.json` | Strict TypeScript compiler settings, JSX configuration, source inclusion, and the `@/*` path alias. |
| `vite.config.ts` | Vite, React, Tailwind, Figma Make plugins, development/preview server settings, build behavior, HTML metadata injection, and the `@` alias. |
| `.mise.toml` | Declares the repository toolchain versions for mise. |
| `.gitignore` | Excludes dependencies, build output, environment files, caches, logs, and platform-managed state. |
| `AGENTS.md` | Repository-specific guidance for development, structure, dependencies, and styling. |
| `CLAUDE.md` | Points Claude-based tooling to `AGENTS.md`. |
| `README.md` | Project heading only; it currently contains no setup or product documentation. |
| `.figma/make/site.json` | Figma Make site metadata. The current configuration disables indexing through generated `robots.txt` and a `noindex, nofollow` meta tag. |
| `src/vite-env.d.ts` | Vite client type declarations for the TypeScript build. |
|
`node_modules/` is installed dependency output and is not application source. `src/assets/attachment.png` is a local asset currently present in the repository; no source component imports it.

### Application source

| File | Purpose |
| --- | --- |
| `src/main.tsx` | Browser entrypoint. Imports global CSS and mounts `App` inside `React.StrictMode`. |
| `src/App.tsx` | Application composition root. Defines `CartItem`, auth gating, the authenticated shell, routes, cart state, search state, and role-based route registration. |
| `src/index.css` | Global styles, Google Font imports, Tailwind v4 import, theme variables, typography, and scrollbar styling. |
| `src/context/AuthContext.tsx` | React auth context with seeded customer/admin accounts, in-memory login/signup/logout, current user state, profile types, and role types. |
| `src/components/Sidebar.tsx` | Authenticated navigation. Changes menu items and branding based on whether the current user is a customer or admin. |
| `src/components/TopNav.tsx` | Authenticated top bar. Owns the account dropdown UI and logout action; receives and updates global search text and displays the customer cart count. |
| `src/pages/Login.tsx` | Login form, client-side validation, demo credentials, and simulated loading delay. |
| `src/pages/SignUp.tsx` | Signup form, basic validation, role selection, and simulated loading delay. |
| `src/pages/Home.tsx` | Customer landing page, hard-coded promotions/categories/products, client-side product search, image loading, and add-to-cart controls. |
| `src/pages/FullMenu.tsx` | Full product catalog with category tabs, local search, product cards, and add-to-cart controls. |
| `src/pages/Cart.tsx` | Cart display, quantity/removal controls, promo-code validation, tax/total calculation, and simulated checkout navigation. |
| `src/pages/ThankYou.tsx` | Post-checkout confirmation screen with a randomly generated demo order number and navigation actions. |
| `src/pages/Profile.tsx` | Displays the current auth profile plus hard-coded taste profile, rewards, subscription, and order history data. |
| `src/pages/Concierge.tsx` | Local chat UI with hard-coded keyword response matching and simulated typing delay. |
| `src/pages/Subscriptions.tsx` | Displays hard-coded subscription plans and simulates adding a plan without changing cart or subscription state. |
| `src/pages/AdminHome.tsx` | Admin bulk-supply catalog, quantity editing, local filtering, discount calculation, simulated bulk-order submission, and hard-coded recent orders. |
| `src/pages/Analytics.tsx` | Admin analytics dashboard using hard-coded KPI, chart, subscription, insight, and inventory data rendered with Recharts. |
| `src/pages/Inventory.tsx` | Admin inventory table with local category/search/alert filters and in-memory stock editing. |
| `src/imports/pasted_text/ai-bakery-platform.md` | Imported design/product reference text. It is not imported by the running application. |

## Component Hierarchy

```text
src/main.tsx
└── React.StrictMode
    └── App
        └── AuthProvider
            └── BrowserRouter
                └── AppShell
                    ├── AuthGate (when user is null)
                    │   ├── Login
                    │   └── SignUp
                    └── Authenticated shell (when user exists)
                        ├── Sidebar
                        ├── TopNav
                        └── main
                            └── Routes
                                ├── Home or AdminHome at /
                                ├── FullMenu at /menu
                                ├── Cart at /cart
                                ├── ThankYou at /thankyou
                                ├── Profile at /profile
                                ├── Concierge at /concierge
                                ├── Subscriptions at /subscriptions
                                ├── Analytics at /analytics (admin only)
                                └── Inventory at /inventory (admin only)
```

`Home` and `FullMenu` render their own product-card markup. There is no shared product-card, product-data, pricing, API, or domain-model module yet. `AppShell` passes cart callbacks into customer shopping pages. `Sidebar`, `TopNav`, and pages read the current user through `useAuth()`.

## Routing Structure

Routing uses `react-router-dom` v7's declarative `BrowserRouter`, `Routes`, and `Route` APIs in `src/App.tsx`.

| Path | Access | Rendered page | Notes |
| --- | --- | --- | --- |
| `/` | Authenticated | `AdminHome` for admins; `Home` for customers | Role-dependent landing page. |
| `/menu` | Authenticated | `FullMenu` | Customer menu; route is registered for admins too, but navigation does not expose it. |
| `/cart` | Authenticated | `Cart` | Shared cart state is passed from `AppShell`. |
| `/thankyou` | Authenticated | `ThankYou` | Checkout is simulated and clears the cart before navigating here. |
| `/profile` | Authenticated | `Profile` | Profile data comes from auth state; history and rewards are static. |
| `/concierge` | Authenticated | `Concierge` | Local keyword-matching chat. |
| `/subscriptions` | Authenticated | `Subscriptions` | Plan selection is local UI state; it does not add a subscription to the cart. |
| `/analytics` | Admin UI | `Analytics` | Registered only when `user.role === 'admin'`. |
| `/inventory` | Admin UI | `Inventory` | Registered only when `user.role === 'admin'`. |
| Any unmatched path | Authenticated | Role-dependent `AdminHome` or `Home` | Fallback instead of a dedicated 404 page. |

There is no unauthenticated URL-based route. When no user exists, `AppShell` replaces the router content with `AuthGate`; login and signup are switched by local component state rather than URL routes. Role checks are present in route registration and the home-page decision, but there is no reusable authorization guard for direct navigation or future API calls.

## API and External Integrations

There is no application backend or API client in the repository. Current external/browser integrations are:

- **Unsplash images:** `Home` and `FullMenu` construct `https://images.unsplash.com/...` URLs from hard-coded photo IDs. Images are loaded directly by the browser and are not proxied, cached, or validated by the app.
- **Google Fonts:** `src/index.css` imports Fraunces and Nunito from `fonts.googleapis.com`.
- **Clipboard API:** `Home` calls `navigator.clipboard.writeText()` when a promotion code is copied. Failure is intentionally ignored.
- **Browser navigation:** `Inventory` uses `window.location.href = '/'` for reorder actions instead of router navigation.
- **Recharts:** `Analytics` uses the library to render charts, but the chart data is local constants rather than an analytics API response.

The concierge is not connected to an AI provider. Its responses are selected by substring matching in `Concierge.tsx`. Checkout, email confirmation, inventory ordering, subscription enrollment, notifications, and recommendation claims are visual simulations only.

## State Management

State is managed with React local state and one React context; there is no Redux, Zustand, server-state library, persistence layer, or URL state model.

| State | Owner | Scope and behavior |
| --- | --- | --- |
| `accounts` | `AuthProvider` | In-memory account list. Seed accounts and newly created accounts disappear on refresh. |
| `user` | `AuthProvider` | Current profile or `null`. Controls auth gating and role-dependent UI. |
| Auth form fields/loading/errors | `Login`, `SignUp` | Local form state. Login/signup use artificial `setTimeout` delays. |
| `cartItems` | `AppShell` | Shared customer cart. Add, increment/decrement, remove, and clear callbacks are passed to pages. It is lost on refresh and is not persisted per user. |
| `searchQuery` | `AppShell` | Shared top-nav search value. `Home` consumes it; `FullMenu` copies it only at initial render, so later top-nav changes are not synchronized. |
| Account menu visibility | `TopNav` | Local dropdown state. |
| Product/menu filters and add feedback | `Home`, `FullMenu` | Local tab, search, quantity, and temporary confirmation state. Product catalogs are duplicated between pages. |
| Promo input and applied discount | `Cart` | Local checkout calculation state. Promo codes are hard-coded in the page. |
| Admin supply quantities/order submission | `AdminHome` | Local catalog state; submission resets after a timeout. |
| Inventory edits and filters | `Inventory` | Local inventory state; edits disappear on refresh. |
| Concierge messages/typing | `Concierge` | Local chat transcript and simulated response delay. |
| Subscription selection/add feedback | `Subscriptions` | Local visual state only; no persisted subscription or cart mutation. |

## Areas Needing Improvement

### Priority 1: Production correctness and security

- Replace seeded client-side credentials and plaintext passwords with server-side authentication, hashed passwords, sessions or short-lived tokens, logout invalidation, password recovery, and role authorization enforced by the backend.
- Remove the public signup role selector. A user must not be able to create an admin account from the browser.
- Add server-side authorization for every customer/admin operation; hiding routes in the UI is not a security boundary.
- Implement a real checkout flow with server-side price, tax, promotion, stock, and order validation plus a payment provider. The current checkout clears the cart without creating an order.
- Avoid claiming that passwords are encrypted or confirmation emails are sent when the prototype does not perform those operations.

### Priority 2: Data and product integration

- Introduce a backend API and database for users, products, pricing, promotions, carts, orders, subscriptions, inventory, analytics, and audit history.
- Create a typed API client and shared domain types. Replace the duplicated product catalogs in `Home.tsx` and `FullMenu.tsx` with one source of truth.
- Connect the concierge to a controlled recommendation/AI service with authentication, prompt/data boundaries, error handling, rate limiting, and a fallback state.
- Persist cart and user state, preferably server-side for authenticated users, with clear loading, empty, stale, and error states.
- Connect admin ordering and inventory edits to transactional backend operations, including minimum-order validation, concurrency handling, and reorder workflows.

### Priority 3: Front-end architecture and UX

- Add reusable components for product cards, quantity controls, badges, cards, form fields, tables, loading states, and error states.
- Extract page data, pricing rules, promo validation, and calculations into domain modules or services that can be unit tested independently of rendering.
- Add a reusable `RequireRole`/protected-route boundary and a real 404 route. Use `useNavigate()` instead of `window.location.href` for internal navigation.
- Decide whether search is global or page-local. The current `FullMenu` search initializes from the global query but then diverges.
- Make subscriptions actually update subscription/cart state and make profile actions such as taste-profile updates and reorder functional.
- Improve responsive behavior for dense admin tables and the fixed sidebar/top navigation; add accessible labels, keyboard/focus states, and error announcements where needed.

### Priority 4: Delivery quality

- Add unit tests for auth validation, role behavior, cart operations, promo calculations, inventory status, and concierge matching.
- Add component and end-to-end tests for customer checkout and admin workflows.
- Add linting/typecheck scripts and run them in CI alongside `npm run build`.
- Standardize on npm or pnpm and remove the unused duplicate lockfile.
- Expand `README.md` with setup, demo credentials for local-only development, scripts, architecture, and deployment notes.
- Add environment-based configuration for API URLs, image hosting, analytics, and feature flags; do not commit secrets.
- Replace or self-host remote fonts and images if predictable offline builds, privacy, or licensing requirements matter.

## Typical Data Flow

```text
User interaction
  -> page/component local state
  -> callback or useAuth()
  -> AppShell/AuthProvider state
  -> re-rendered shell/page

Future production flow
  -> page action
  -> typed API client
  -> authenticated backend
  -> database/payment/AI provider
  -> query cache + UI state
```
