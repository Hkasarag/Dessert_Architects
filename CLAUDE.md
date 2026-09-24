# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

> AGENTS.md is the Figma Make scaffold guide. Its note that a dev server is "already running" only holds inside Figma Make. Locally, start the servers yourself (see Commands).

## Project overview

Dessert Architects is a demo ordering platform for a fictional bakery franchise, **Frosted Corner**. It has two role-based experiences in one React SPA:

- **Customer**: browse the seasonal menu, add items and subscriptions to a cart, check out, view order history, and chat with the "AI Dessert Concierge".
- **Admin / franchise**: bulk-order ingredients from HQ, view inventory and business analytics, and chat with a franchise operations assistant.

The "AI agents" are **deterministic, rule-based TypeScript functions** (regex intent routing plus hardcoded datasets). There is no LLM or Azure OpenAI call anywhere in the code yet, despite what `src/agents/Coding-Agent.md` describes.

## Commands

Toolchain: Node 22 and pnpm 10 (pinned in `.mise.toml`). Both `package-lock.json` and `pnpm-lock.yaml` are committed; keep them in sync if you change dependencies.

```bash
npm install            # or: pnpm install
npm run dev            # Vite frontend on $PORT (default 8443, strictPort)
npm run server         # Express API on port 5050 (reads server/config.env)
npm run build          # production build to dist/
npx tsc --noEmit       # typecheck (covers src/ and vite.config.ts only)
npm run format         # oxfmt formatter
```

There is no test suite and no linter. Verify changes with `npx tsc --noEmit` and `npm run build`, then exercise the UI in the browser.

The frontend and backend run as two separate processes. Pages that save or load orders need `npm run server` running and a reachable MongoDB.

**Demo logins** (seeded in `src/context/AuthContext.tsx`): customer `margaret` / `password123`, admin `admin` / `admin123`. Auth is purely client-side and in-memory; sign-ups vanish on reload.

## Architecture

### Frontend (`src/`)

- `App.tsx` owns the router, the cart state (`CartItem[]`), and the global search query, and passes them down as props. There is no state library. `AuthGate` shows Login/SignUp until a user exists.
- Routes are role-gated in `App.tsx`: `/` renders `AdminHome` for admins and `Home` for customers. `/analytics` and `/inventory` exist only for admins. `Sidebar.tsx` shows a different nav per role, so update both when adding a page.
- `src/data/menuProducts.ts` is the customer menu used by Home, FullMenu, and Analytics (numeric ids, `price`, `unitCost`, `season`, with `isInSeason()` filtering seasonal items).
- `src/data/IngredientProducts.ts` is the ingredient catalog used by Inventory and Analytics.
- `AdminHome.tsx` keeps its own inline supply `catalog`, separate from `IngredientProducts.ts`.
- `src/imports/pasted_text/ai-bakery-platform.md` is the original design brief (brand personality, audience includes elderly users, visual style).

### Agent system (`src/agents/`)

Request flow: user text → `routeCustomerIntent` / `routeAdminIntent` (regex matching in `router.ts`, returns an `AgentRoute` with an intent) → `executeAgentByIntent(intent, text, role)` (enforces the per-role allowlist and dispatches) → an agent function returns a structured object → `formatAgentResponse` in `responseFormatter.ts` turns it into chat text.

- Customer agents: productRecommendation, partyPlanner, customerService, cartOptimization, nutritionalAllergy. Used by `pages/Concierge.tsx`.
- Admin agents: franchiseReordering, promotionRecommendation. Used by the chat on `pages/AdminHome.tsx`.
- Regex order in `router.ts` matters: the first match wins, so broad patterns (for example `dessert`, `nut`, `po`) can capture messages meant for later agents.
- Agent data is separate from the UI catalog. `menuDataset.ts` (string ids like `m-001`, plus `searchFuzzy`, `safeOptions`, `seasonalItems`) feeds most customer agents. `types.ts` holds `productCatalog`, promotions, inventory, and order-status mock data.
- To add an agent: add the intent to `AgentIntent` in `types.ts`, a routing rule in `router.ts`, the role allowlist and switch case in `executeAgentByIntent`, a formatter branch in `responseFormatter.ts`, and an export in `agentSystem.ts`.

### Backend (`server/`)

Plain ESM JavaScript Express 5 app using the native `mongodb` driver (mongoose is installed but unused). Database name: `DessertArchitects`.

- `db/connection.js` loads `server/config.env` via `process.loadEnvFile` and connects at import time using top-level await. It needs `MONGODB_URI`.
- `GET /orders?customerId=&limit=` and `POST /orders` use the `orders` collection. Customer orders use the username as `customerId`. Every item needs `unitCost > 0`, so keep `unitCost` on menu products and cart items.
- `GET /inventory?locationId=&limit=` and `POST /inventory` use the `inventory` collection for ingredient purchase transactions (default `locationId` is `ATL001`).
- **Routing quirk:** `POST /orders` first runs `createInventory`. If the body has a `lineItems` array, it is stored as an inventory transaction; otherwise it falls through to the customer order router. `AdminHome` bulk orders rely on this.
- List endpoints default to 3 results, capped at 50.
- The frontend calls the API with hardcoded `http://localhost:5050` URLs in `Cart.tsx`, `AdminHome.tsx`, `Inventory.tsx`, and `Profile.tsx`. There is no Vite proxy or env variable for the API base.

## Conventions

- Styling is Tailwind v4 utilities plus CSS variables defined in `src/index.css` (`--primary`, `--muted`, `--border`, and so on). Components commonly pass `style={{ background: 'var(--card)' }}` inline. Reuse the existing tokens rather than hardcoding new colors.
- Headings use the Fraunces font and body text uses Nunito, both loaded from Google Fonts in `index.css`.
- Keep UI large, warm, and simple, since the design brief targets older customers too.
- TypeScript is `strict`. The `@/` alias maps to `src/`, though existing code uses relative imports.
- Keep customer and admin capabilities separated. Customer pages must not expose admin agents or data, and vice versa.

## Gotchas

- `server/config.env` holds the MongoDB connection string and is committed despite `.gitignore` listing `.env*` (that pattern does not match `config.env`). Do not add more secrets there, and do not print its contents.
- `scripts/importInvetoryHistory,js` is an empty file with a comma in its name.
- `.figma/` contains Figma Make platform tooling. Do not edit it; `vite.config.ts` reads `.figma/make/site.json`.
- The sidebar logo text still says "Crumb & Joy", the brand's old name.
