# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

> AGENTS.md is the Figma Make scaffold guide. Its note that a dev server is "already running" only holds inside Figma Make. Locally, start the servers yourself (see Commands).

## Project overview

Dessert Architects is a demo ordering platform for a fictional bakery franchise, **Frosted Corner**. It has two role-based experiences in one React SPA:

- **Customer**: browse the seasonal menu, add items and subscriptions to a cart, check out, view order history, and chat with the "AI Dessert Concierge".
- **Admin / franchise**: bulk-order ingredients from HQ, view inventory and business analytics, and chat with a franchise operations assistant.

The AI agents run on the Express server and call an **Azure OpenAI gpt-5-mini** deployment. The browser never holds the API key.

## Commands

Toolchain: Node 22 and pnpm 10 (pinned in `.mise.toml`). Both `package-lock.json` and `pnpm-lock.yaml` are committed; keep them in sync if you change dependencies.

```bash
npm install            # or: pnpm install
npm run dev            # Vite frontend on $PORT (default 8443, strictPort)
npm run server         # Express API on port 5050 (reads server/config.env, then server/.env)
npm run build          # production build to dist/
npx tsc --noEmit       # typecheck (covers src/ and vite.config.ts only)
npm run format         # oxfmt formatter
```

There is no test suite and no linter. Verify changes with `npx tsc --noEmit` and `npm run build`, then exercise the UI in the browser.

The frontend and backend run as two separate processes. Pages that save or load orders, and both chatbots, need `npm run server` running. The chatbots also need Azure OpenAI settings in `server/.env`; copy `server/.env.example` to start. The server imports `.ts` data files from `src/data` directly, which needs Node 22.18 or newer.

**Demo logins** (seeded in `src/context/AuthContext.tsx`): customer `margaret` / `password123`, admin `admin` / `admin123`. Auth is purely client-side and in-memory; sign-ups vanish on reload.

## Architecture

### Frontend (`src/`)

- `App.tsx` owns the router, the cart state (`CartItem[]`), and the global search query, and passes them down as props. There is no state library. `AuthGate` shows Login/SignUp until a user exists.
- Routes are role-gated in `App.tsx`: `/` renders `AdminHome` for admins and `Home` for customers. `/analytics` and `/inventory` exist only for admins. `Sidebar.tsx` shows a different nav per role, so update both when adding a page.
- `src/data/menuProducts.ts` is the customer menu used by Home, FullMenu, and Analytics (numeric ids, `price`, `unitCost`, `season`, with `isInSeason()` filtering seasonal items).
- `src/data/IngredientProducts.ts` is the ingredient catalog used by Inventory and Analytics.
- `AdminHome.tsx` keeps its own inline supply `catalog`, separate from `IngredientProducts.ts`.
- `src/imports/pasted_text/ai-bakery-platform.md` is the original design brief (brand personality, audience includes elderly users, visual style).

### Agent system (`server/agents/`)

Request flow: the chat UI posts the conversation to `POST /chat` with the user's role, and the customer's username and cart for customers. `orchestrator.js` asks the model to pick one agent using a strict JSON schema. It blocks any agent that belongs to the other role, then runs the chosen agent with its own system prompt and data. `src/lib/chatApi.ts` is the client for this endpoint.

- Customer agents: productRecommendation, partyPlanner, cartOptimization, nutritionalAllergy, customerService. They are used by `pages/Concierge.tsx`.
- Admin agents: franchiseReordering and promotionRecommendation. They are used by the chat on `pages/AdminHome.tsx`.
- Each agent module exports `id`, `role`, `description` (read by the router), `instructions`, and `buildContext()`, and can export `tools`. To add an agent, create the module and add it to the `AGENTS` list in `orchestrator.js`.
- Keep arithmetic and safety decisions in deterministic tools, not in the model. Examples are `price_party_order`, `find_safe_menu_items`, and `simulate_promotion`, plus the precomputed reorder plan.
- `agents/data.js` builds each agent's grounding data. Customer agents must never receive costs, margins, sales, or inventory. Menu prices come from `src/data/menuProducts.ts`. Allergens are joined by name from `src/agents/menuDataset.ts`, and promotions come from `src/agents/types.ts`. Orders, sales, and purchase orders are read from MongoDB with a 4-second timeout that falls back to empty data.
- `server/ai/azureClient.js` uses the classic versioned Azure API when `AZURE_OPENAI_API_VERSION` is set, and Azure's v1 API otherwise.

### Backend (`server/`)

Plain ESM JavaScript Express 5 app using the native `mongodb` driver (mongoose is installed but unused). Database name: `DessertArchitects`.

- `db/connection.js` loads `server/config.env` via `process.loadEnvFile` and connects at import time using top-level await. It needs `MONGODB_URI`.
- `GET /orders?customerId=&limit=` and `POST /orders` use the `orders` collection. Customer orders use the username as `customerId`. Every item needs `unitCost > 0`, so keep `unitCost` on menu products and cart items.
- `GET /inventory?locationId=&limit=` and `POST /inventory` use the `inventory` collection for ingredient purchase transactions (default `locationId` is `ATL001`).
- `POST /chat` is the agent orchestrator described above. It returns 503 when Azure OpenAI isn't configured.
- **Routing quirk:** `POST /orders` first runs `createInventory`. If the body has a `lineItems` array, it is stored as an inventory transaction; otherwise it falls through to the customer order router. `AdminHome` bulk orders rely on this.
- List endpoints default to 3 results, capped at 50.
- The frontend calls the API with hardcoded `http://localhost:5050` URLs in `Cart.tsx`, `AdminHome.tsx`, `Inventory.tsx`, `Profile.tsx`, and `lib/chatApi.ts`. There is no Vite proxy or env variable for the API base.

## Conventions

- Styling is Tailwind v4 utilities plus CSS variables defined in `src/index.css` (`--primary`, `--muted`, `--border`, and so on). Components commonly pass `style={{ background: 'var(--card)' }}` inline. Reuse the existing tokens rather than hardcoding new colors.
- Headings use the Fraunces font and body text uses Nunito, both loaded from Google Fonts in `index.css`.
- Keep UI large, warm, and simple, since the design brief targets older customers too.
- TypeScript is `strict`. The `@/` alias maps to `src/`, though existing code uses relative imports.
- Keep customer and admin capabilities separated. Customer pages must not expose admin agents or data, and vice versa.

## Gotchas

- `server/config.env` holds the MongoDB connection string and is committed despite `.gitignore` listing `.env*` (that pattern does not match `config.env`). Put new secrets such as Azure keys in the ignored `server/.env`, never in `config.env`, and do not print either file.
- Role checks for the agents rely on the role the browser sends, because login is client-side only.
- `scripts/importInvetoryHistory,js` is an empty file with a comma in its name.
- `.figma/` contains Figma Make platform tooling. Do not edit it; `vite.config.ts` reads `.figma/make/site.json`.
- The sidebar logo text still says "Crumb & Joy", the brand's old name.
