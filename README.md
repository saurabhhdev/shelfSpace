# Shelfspace — Developer Resource Management Workspace

> A focused personal workspace for collecting, organizing, discovering, and reusing developer resources while building software.

Shelfspace brings scattered developer resources—repositories, UI components, documentation, tools, color palettes, and code snippets—into one unified, searchable library and connects them directly to projects and collections where they are used.

---

## 🛠 Tech Stack

### Frontend
- **React 19** + **TypeScript**
- **Vite 8** with `@tailwindcss/vite` (Tailwind CSS v4)
- **Lucide Icons** & **Flaticon UIcons**
- **React Router v7** (protected authentication routes, nested layouts, client-side routing)
- **Axios** (centralized API client with automatic token refresh & Bearer token fallback)
- **TanStack Query v5** (asynchronous state management)

### Backend
- **Node.js** + **Express** + **TypeScript**
- **Vercel Serverless Functions** (`api/index.ts` handler) & Local Node HTTP Server
- **PostgreSQL** ([Neon Serverless Postgres](https://neon.tech)) with **Drizzle ORM**
- **Vercel Cron** (`0 0 * * *` automated 30-day trash cleanup with `CRON_SECRET` protection)
- **Zod** (runtime request validation middleware)
- **Cross-Origin Authentication** with `SameSite=none`, `Secure=true`, and Dual Token Bearer support
- **Cheerio** + **Safe Fetch** (SSRF-protected URL metadata extraction & OpenGraph parser)
- **Security**: Helmet, CORS origin allowlisting, Express-Rate-Limit, reverse proxy trust, DNS IP checks
- **Testing**: **Vitest** + **Supertest** (22 automated integration tests)

---

## 📁 Project Structure

```text
shelfspace/
├── backend/
│   ├── api/
│   │   └── index.ts             # Vercel Serverless Function entry point
│   ├── src/
│   │   ├── config/              # Database connection & environment configuration
│   │   ├── db/                  # Drizzle ORM schema, migrations, connection pool
│   │   ├── middleware/          # Auth guards, validation, rate limiting, error handlers
│   │   ├── modules/
│   │   │   ├── auth/            # Auth controller, service, token rotation, sessions
│   │   │   ├── cron/            # Vercel Cron maintenance routes & secret guard
│   │   │   ├── resources/       # Resource CRUD, metadata extraction, classification
│   │   │   ├── projects/        # Project management & resource association
│   │   │   ├── collections/     # Collections & category organization
│   │   │   └── search/          # Search & multi-filter service
│   │   ├── scripts/             # Seed & data wipe utilities
│   │   ├── tests/               # Vitest integration test suite (22 tests)
│   │   ├── utils/               # SSRF validation, logger, response formatters
│   │   ├── app.ts               # Shared Express application configuration
│   │   └── server.ts            # Local standalone development server entry point
│   ├── drizzle.config.ts        # Drizzle Kit configuration
│   ├── vercel.json              # Vercel Function rewrites & cron configuration
│   ├── package.json
│   └── tsconfig.json
│
├── frontend/
│   ├── public/                  # Favicons, SVGs, and _redirects for SPA routing
│   ├── src/
│   │   ├── api/                 # Axios client with transparent 401 token refresh & dual token support
│   │   ├── components/
│   │   │   ├── collections/     # Create & edit collection modals
│   │   │   ├── landing/         # Landing hero, features, FAQ, product tour
│   │   │   ├── layout/          # AppLayout, responsive sidebar drawer, top search header
│   │   │   ├── projects/        # Project cards & creation modals
│   │   │   ├── resources/       # Resource cards, QuickAddDrawer, ResourceModal
│   │   │   ├── search/          # Command palette (Ctrl+K / Cmd+K)
│   │   │   └── ui/              # Alert, Button, Dialog, Input, Flaticon, LoadingState
│   │   ├── context/             # AuthContext, NotificationContext
│   │   ├── lib/                 # Resource types, clsx/tailwind-merge utility
│   │   ├── pages/               # Auth, Dashboard, Library, Projects, Collections, Trash, Settings
│   │   ├── types/               # TypeScript interfaces
│   │   ├── App.tsx              # Router configuration & route guards
│   │   └── main.tsx             # Application mount point
│   ├── vercel.json              # Vercel SPA rewrite configuration
│   ├── package.json
│   └── vite.config.ts
│
├── .env.example                 # Root environment reference
├── package.json                 # Workspace scripts
└── README.md
```

---

## 🚀 Local Development Setup

### 1. Prerequisites
- **Node.js** (v18 or higher)
- **npm** (v9 or higher)
- A **Neon PostgreSQL** database (or local PostgreSQL)

### 2. Installation

Clone the repository and install dependencies:

```bash
git clone https://github.com/saurabhhdev/shelfSpace.git
cd shelfSpace

# Install backend dependencies
cd backend && npm install

# Install frontend dependencies
cd ../frontend && npm install

# Return to root
cd ..
```

### 3. Environment Configuration

Create `.env` files in both `backend` and `frontend`:

#### Backend (`backend/.env`):
```env
PORT=5000
NODE_ENV=development
DATABASE_URL=postgresql://user:password@endpoint-pooler.neon.tech/neondb?sslmode=require
JWT_ACCESS_SECRET=shelfspace_dev_access_secret_super_secure_key_12345
JWT_REFRESH_SECRET=shelfspace_dev_refresh_secret_super_secure_key_67890
ACCESS_TOKEN_EXPIRY=15m
REFRESH_TOKEN_EXPIRY=7d
FRONTEND_URL=http://localhost:5173
COOKIE_DOMAIN=
COOKIE_SAME_SITE=lax
COOKIE_SECURE=false
CRON_SECRET=local_cron_maintenance_secret
```

#### Frontend (`frontend/.env`):
```env
VITE_API_URL=/api
```

### 4. Database Setup & Migration

Push the schema to your Neon PostgreSQL database using Drizzle Kit:

```bash
cd backend
npm run db:push
```

Seed initial developer resources and the clean demo account:

```bash
npm run seed
```

**Default Demo Account:**
- **Email:** `demo@shelfspace.dev`
- **Password:** `Password123!`

### 5. Running Local Development

From the repository root:

```bash
# Terminal 1 — Backend (http://localhost:5000)
npm run dev:backend

# Terminal 2 — Frontend (http://localhost:5173)
npm run dev:frontend
```

---

## ☁️ Vercel + Neon Production Deployment

The application is deployed as **two separate Vercel projects** connected to the **SAME GitHub repository**:
- **Project 1 (Frontend):** `shelfspace.vercel.app` (Root Directory: `frontend`)
- **Project 2 (Backend API):** `shelfspace-api.vercel.app` (Root Directory: `backend`)
- **Database:** [Neon PostgreSQL](https://neon.tech) (Serverless pooled connection)

```
[User Browser]
      │
      ▼
┌─────────────────────────────────┐
│   Frontend Vercel Project       │
│   https://shelfspace.vercel.app │
│   (Vite + React SPA)            │
└────────────────┬────────────────┘
                 │ Cross-Origin HTTPS
                 │ (withCredentials + Bearer Token)
                 ▼
┌─────────────────────────────────────┐
│   Backend Vercel Project            │
│   https://shelfspace-api.vercel.app │
│   (Express Vercel Function)         │
└────────────────┬────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────┐
│   Neon PostgreSQL Database          │
│   (Serverless Connection Pooler)    │
└─────────────────────────────────────┘
```

---

### Step 1: Prepare Neon PostgreSQL Database

1. Sign in to your [Neon Console](https://console.neon.tech).
2. Create a new project named `shelfspace`.
3. In the Neon Dashboard, copy your connection string.
   - For application requests in Vercel, check the **"Pooled connection"** checkbox to use the connection pooler endpoint (contains `-pooler` in the hostname).
   - Format: `postgresql://user:password@ep-xyz-pooler.us-east-2.aws.neon.tech/neondb?sslmode=require`
4. From your local terminal, apply the schema to Neon:
   ```bash
   cd backend
   DATABASE_URL="<your-neon-direct-or-pooled-url>" npm run db:push
   DATABASE_URL="<your-neon-direct-or-pooled-url>" npm run seed
   ```

---

### Step 2: Deploy Backend Vercel Project (`shelfspace-api`)

1. Go to your [Vercel Dashboard](https://vercel.com/dashboard) and click **"Add New"** > **"Project"**.
2. Select your repository: `saurabhhdev/shelfSpace`.
3. In the project setup screen:
   - **Project Name:** `shelfspace-api` (or custom name)
   - **Framework Preset:** `Other`
   - **Root Directory:** Click "Edit" and choose `backend`
   - **Build Command:** `npm run build`
   - **Output Directory:** Leave default
4. Add the following **Environment Variables**:

| Variable | Value | Notes |
|---|---|---|
| `NODE_ENV` | `production` | Enables production security & trust proxy |
| `DATABASE_URL` | `postgresql://...-pooler...neon.tech/neondb?sslmode=require` | Use Neon Pooled connection string |
| `PG_MAX_POOL` | `5` | Maximum database pool clients per serverless function |
| `JWT_ACCESS_SECRET` | `<32+ char random string>` | Generate e.g. via `openssl rand -hex 32` |
| `JWT_REFRESH_SECRET` | `<32+ char random string>` | Generate e.g. via `openssl rand -hex 32` |
| `FRONTEND_URL` | `https://shelfspace.vercel.app` | Exact URL of your Frontend Vercel Project |
| `COOKIE_SAME_SITE` | `none` | Required for cross-subdomain cookies on Vercel |
| `COOKIE_SECURE` | `true` | Required when `SameSite=none` (HTTPS) |
| `CRON_SECRET` | `<32+ char random string>` | Protects the daily maintenance cron endpoint |

5. Click **"Deploy"**.
6. Note the deployed backend URL: `https://shelfspace-api.vercel.app`.
   - Verify health: Visit `https://shelfspace-api.vercel.app/api/health` in your browser. It should return `{"success": true, "data": {"status": "healthy"}}`.

---

### Step 3: Deploy Frontend Vercel Project (`shelfspace`)

1. Go to your [Vercel Dashboard](https://vercel.com/dashboard) and click **"Add New"** > **"Project"**.
2. Select the **same** repository: `saurabhhdev/shelfSpace`.
3. In the project setup screen:
   - **Project Name:** `shelfspace`
   - **Framework Preset:** `Vite`
   - **Root Directory:** Click "Edit" and choose `frontend`
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
4. Add the following **Environment Variable**:

| Variable | Value | Notes |
|---|---|---|
| `VITE_API_URL` | `https://shelfspace-api.vercel.app/api` | Full URL to your backend `/api` |

5. Click **"Deploy"**.
6. Visit `https://shelfspace.vercel.app`. Your application is now live!

---

### Step 4: Verify Cross-Domain Authentication & CORS

1. In `shelfspace-api` Vercel settings, verify that `FRONTEND_URL` matches your actual frontend domain (`https://shelfspace.vercel.app`).
2. Log in using `demo@shelfspace.dev` / `Password123!`.
3. Open Developer Tools > Network:
   - The `/api/auth/login` response will set `access_token` and `refresh_token` cookies with `SameSite=None; Secure; HttpOnly`.
   - The frontend Axios client automatically caches the Bearer access token for browsers with strict third-party cookie isolation.

---

### Step 5: Vercel Cron Maintenance (Expired Trash Cleanup)

- Configured in `backend/vercel.json`:
  ```json
  {
    "crons": [
      {
        "path": "/api/cron/cleanup-trash",
        "schedule": "0 0 * * *"
      }
    ]
  }
  ```
- Vercel Cron triggers `GET /api/cron/cleanup-trash` daily at midnight UTC.
- Vercel automatically passes `Authorization: Bearer <CRON_SECRET>`.
- The endpoint permanently purges trashed resources older than 30 days.
- **Manual Verification:**
  ```bash
  curl -X GET "https://shelfspace-api.vercel.app/api/cron/cleanup-trash" \
    -H "Authorization: Bearer <YOUR_CRON_SECRET>"
  ```

---

## 🧪 Testing & Verification

Run the automated integration test suite:

```bash
# Run all 22 tests against Neon PostgreSQL
npm --prefix backend test
```

Build verification:

```bash
# Backend TypeScript compilation
npm --prefix backend run build

# Frontend production bundle
npm --prefix frontend run build
```

---

## 🔒 Security Architecture

1. **SSRF Protection (`backend/src/utils/ssrf.ts`)**: Outbound metadata fetches resolve target hostnames before dispatching requests, blocking loopback (`127.0.0.0/8`), private RFC1918 networks (`10.0.0.0/8`, `172.16.0.0/12`, `192.168.0.0/16`), link-local metadata addresses (`169.254.169.254`), and cloud provider internal metadata endpoints.
2. **Dual-Layer Authentication**: HTTP-Only cookies combined with in-memory Bearer token fallback for seamless compatibility across cross-site subdomains (`*.vercel.app`) and Safari ITP.
3. **Session Revocation & Tracking**: Every session tracks User-Agent, IP address, and last active timestamp. Individual or bulk revocation is enforced on every request.
4. **Tenant Data Ownership Isolation**: Every resource, project, and collection query strictly enforces the authenticated user ID at the SQL query level.
5. **Reverse Proxy Trust**: The backend enables `trust proxy` in production to correctly detect client IPs and enforce rate limits behind reverse proxies (Vercel, Cloudflare).
6. **Graceful Error Sanitization**: Internal 500 errors in production are sanitized to prevent database schema or stack trace leakage to clients.
7. **Protected Maintenance Crons**: Scheduled maintenance endpoints require `CRON_SECRET` authentication.

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).
