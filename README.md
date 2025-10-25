# Morphereum — Admin API 🧰

_A compact, JWT-guarded REST API that powers the Admin Interface for the $Morphereum ecosystem._

> Manage **Raids**, **Links**, and **Arts** with strict validation, per-day caching, rate-limit + slowdown, HTTPS in dev, and clean logs.

---

## ✨ What this API does

- **Auth**: exchanges email/password for a **JWT (1h)**; all admin routes require a valid Bearer token.
- **Raids**: CRUD with UTC-normalized dates (set to 00:00:00 UTC) for consistency across time zones.
- **Links**: CRUD for official/community links with end-of-day in-memory caching.
- **Arts**: paginated review (10 per page), approve/unapprove, and removal synchronized with **Cloudinary**.
- **Perf & Safety**: global **rate-limit** (1000 / 10 min / IP) + **progressive slowdown** after 150 req/min; strict **CORS**.

All routes are mounted under **`/api`**.

---

## 🧱 Tech Stack

- **Runtime**: Node.js, **Express** (JSON server + routers).
- **Security**: **jsonwebtoken** (JWT), protected routers via middleware.
- **Validation**: **zod** for **env** and request bodies/schemas.
- **Data**: **MongoDB** via **Mongoose** (Auth, Raids, Links, Arts models).
- **Uploads/Media**: **Cloudinary** SDK for asset deletion on art removal.
- **Caching**: **NodeCache** with **end-of-day TTL** (computed once on boot).
- **Limits**: **express-rate-limit** + **express-slow-down**.
- **CORS & Logs**: **cors** allowlist; **morgan** with timestamp + color; console patched via **chalk**.
- **Dev HTTPS**: optional self-signed certs (`localhost.pem`, `localhost-key.pem`) auto-loaded in development.

---

## 🔐 Auth & Middleware

- **Public**: `POST /api/auth` (email, password) → `{ token }` (expires in **1h**).
- **Protected**: `/api/raids`, `/api/links`, `/api/arts` require `Authorization: Bearer <token>`.
- **Guard**: middleware validates JWT (`id`, `email`) and ensures the user exists in DB; otherwise responds **401**.

---

## 🚦 Rate-limit, Slowdown, CORS & HTTPS

- **Slowdown**: after **150 req/min**, add `hits * 500ms` delay per request.
- **Rate-limit**: **1000 req / 10 min / IP**; standard headers enabled.
- **CORS**: origins `https://localhost:5174` and `env.CORS_ORIGIN`.
- **HTTPS (dev)**: if `NODE_ENV=development`, server uses local certs automatically.

---

## 🧭 REST Endpoints

> Base path: `/api`

### Auth

- `POST /auth`  
  **Body**:
  ```json
  { "email": "admin@morphereum.xyz", "password": "••••••••" }
  ```
  **200** → `{ "token": "<jwt>" }` • **400** invalid payload • **401** invalid creds.

---

## 📚 API Documentation (Swagger / OpenAPI)

* **Swagger UI** is served at: `http(s)://localhost:<PORT>/docs` (auto-mounted by the server).
* **Raw OpenAPI JSON**: `http(s)://localhost:<PORT>/openapi/openapi.json`.
  Both routes are registered in `src/server.ts` via `swagger-ui-express` and a static mount of the `docs/` folder.

### How it’s organized

The spec is **modular JSON** under `docs/`:

* `docs/openapi.json` – root spec that composes everything else.
* `docs/components/` – reusable **schemas**, **responses**, **parameters**.

  * Responses are “no-body” for errors and OK, matching the runtime helpers.
  * Schemas for Auth, Links, Raids, Arts, and paginated arts response.
  * Common params (e.g., `PathId`, `PageQuery`).
* `docs/paths/**` – individual operation files (Auth, Links, Raids, Arts) referenced by the root `paths`.

### Design notes

* **UI in production is intentionally public.** The `/docs` and `/openapi` endpoints are accessible in prod **by design** to speed up integration and testing. Protected resources still require valid JWTs; only the documentation is public.
* Error/empty responses are modeled without bodies (e.g., `BadRequest`, `Unauthorized`, `NotFound`, `TooManyRequests`, `ServerError`, `Ok200/Empty200`). This mirrors the helpers `ok`, `badRequest`, `unauthorized`, `notFound`, `internalServerError`.
* The spec is **JSON-only** and directly read by Swagger UI; no build step is required after editing `docs/**/*.json`.

### How to update

1. Add or change schemas in `docs/components/schemas.json`.
2. Reuse the shared responses/parameters from `docs/components/*.json`.
3. Create or edit operations under `docs/paths/**` and reference them from `docs/openapi.json`.
4. Open `/docs` to see the updated UI (the server serves the JSON files directly).

> If you ever want to **lock down** docs in production, you can remove the `/docs` and `/openapi` mounts or guard them behind auth. For now, they remain public on purpose.

---

### Raids (protected)

- `GET /raids` → `Raid[]` (cached until EOD).
- `POST /raids`
  ```json
  {
    "date": "2025-10-20T00:00:00.000Z",
    "platform": "X",
    "url": "https://x.com/…",
    "shareMessage": "copy…",
    "content": "# Markdown allowed"
  }
  ```
  **200** on create, invalid → **400**. Dates are coerced to **UTC 00:00**.
- `PUT /raids/:id` → updates (also re-normalizes date to UTC 00:00). **200** or **404** when not found.
- `DELETE /raids/:id` → **200** or **404**. Cache for raids list is cleared after mutations.

---

### Links (protected)

- `GET /links` → `Link[]` (cached until EOD).
- `POST /links`
  ```json
  {
    "label": "DexScreener",
    "url": "https://…",
    "icon": "SiDexscreener",
    "type": "official-links"
  }
  ```
  **200** or **400**.
- `PUT /links/:id` → update by id. **200** or **404/400**.
- `DELETE /links/:id` → remove by id. **200** or **404**. Cache key `linksData` is invalidated on any mutation.

---

### Arts (protected)

- `GET /arts?page=N` →
  ```json
  {
    "arts": [
      {
        "_id": "...",
        "approved": false,
        "name": "<cloudinary-public-id>",
        "creator": "...",
        "xProfile": "...",
        "description": "...",
        "url": "https://..."
      }
    ],
    "page": 1,
    "next": true
  }
  ```
  Pagination size: **10**; cached until EOD. **400** if `page` missing; **404** if no data.
- `PUT /arts/:id`
  ```json
  { "approved": true }
  ```
  **200** or **404/400**; clears cached pages.
- `DELETE /arts/:id` → removes DB record **and** destroys the Cloudinary asset using the art’s **`name`** as public ID. **200** or **404**; clears cached pages.

---

## 🗂️ Data Models (Mongoose + Zod)

- **Auth**: `{ email: string, password: string }` (DB comparison; token embeds `{ id, email }`). Token TTL: **1 hour**.
- **Raid**: `{ date: Date, platform: string, url: string, shareMessage: string, content: string }` (+ Zod schema).
- **Link**: `{ label, url, icon, type: "community-links" | "official-links" }`.
- **Art**: `{ approved: boolean, name, creator, xProfile, description, url }`.

All inbound/outbound data is parsed with Zod before use; invalid shapes short-circuit with **400**.

---

## 🧮 Caching Strategy

- In-memory cache via **NodeCache**; TTL set to **end-of-day (UTC)** using a utility function. Keys include `raidsData`, `linksData`, and `artsData-page-${n}`. Cache is **invalidated** on mutations. On boot, the server logs the formatted TTL (e.g., “X hours and Y minutes”).

---

## 🧰 Logging & Errors

- **morgan** custom format: timestamp (`pt-BR`), colored status code, response time, and content length.
- Console patched with datestamps and colors via **chalk**.
- HTTP helpers (no body unless `sendJson`):

  - `ok(res)` → **200** (empty body)
  - `sendJson(res, data)` → **200** with JSON
  - `badRequest(res)` → **400**
  - `unauthorized(res)` → **401**
  - `notFound(res)` → **404**
  - `internalServerError(res)` → **500**

---

## 🔧 Environment Variables

Validated on startup; process exits if invalid.

```env
# Core
NODE_ENV=development            # or production
PORT=8082
CORS_ORIGIN=https://admin.morphereum.app

# Database
MONGODB_CONNECTION_STRING=mongodb+srv://...
MONGODB_DB_NAME=morphereum

# Auth
JWT_SECRET_KEY=super-secret-key

# Cloudinary (asset deletion for Arts)
CLOUDINARY_CLOUD_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...
```

> In **development**, the server attempts HTTPS using `localhost.pem` and `localhost-key.pem` at the project root.

---

## 🏗️ Project Structure

```
src/
  config/            # env schema (zod), dev cert loader
  controllers/       # arts/, links/, raids/, auth/
  middlewares/       # auth.ts (JWT guard)
  models/            # mongoose schemas + zod (auth, raids, links, arts)
  router/            # mounts /auth (public) and protected /raids /links /arts
  services/          # CRUD + business rules (UTC date normalize, cloudinary)
  utils/             # cache TTL, http helpers, logging, DB/Cloud connections
  server.ts          # express app, CORS, limits, HTTPS (dev), router mount
```

---

## ▶️ Getting Started

```bash
# 1) install
pnpm install        # or npm i / yarn

# 2) env
cp .env.example .env   # fill in Mongo, JWT, CORS, Cloudinary

# 3) run dev (uses HTTPS if NODE_ENV=development and certs exist)
pnpm dev

# 4) prod
pnpm build && pnpm start
```

The server logs:

- `[server] --> Running at http(s)://localhost:<PORT>`
- `[cache] --> End of the day's TTL is set to <H> hours and <M> minutes`
- `[mongo-db] --> Connected.`

---

## 🧩 Example Requests

### 1) Login

```bash
curl -X POST http://localhost:8082/api/auth \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@morphereum.xyz","password":"secret"}'
```

### 2) Create a Raid

```bash
curl -X POST http://localhost:8082/api/raids \
  -H "Authorization: Bearer <JWT>" \
  -H "Content-Type: application/json" \
  -d '{"date":"2025-10-20T00:00:00.000Z","platform":"X","url":"https://x.com/...","shareMessage":"Let’s raid!","content":"# Goals\\n- post meme"}'
```

### 3) Approve an Art

```bash
curl -X PUT http://localhost:8082/api/arts/<id> \
  -H "Authorization: Bearer <JWT>" \
  -H "Content-Type: application/json" \
  -d '{"approved": true}'
```

### 4) Delete an Art (also deletes Cloudinary asset)

```bash
curl -X DELETE http://localhost:8082/api/arts/<id> \
  -H "Authorization: Bearer <JWT>"
```

---

### Made for the Morphereum core team 🛡️
