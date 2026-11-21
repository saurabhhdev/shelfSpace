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
- **Axios** (centralized API client with automatic token refresh)
- **TanStack Query v5** (asynchronous state management)

### Backend
- **Node.js** + **Express** + **TypeScript**
- **PostgreSQL** (Neon Serverless Postgres) with **Drizzle ORM**
- **Zod** (runtime request validation middleware)
- **HTTP-Only Cookies** with configurable `SameSite` & `Secure` policies
- **Cheerio** + **Safe Fetch** (SSRF-protected URL metadata extraction & OpenGraph parser)
- **Security**: Helmet, CORS origin allowlisting, Express-Rate-Limit, reverse proxy trust, DNS IP checks
- **Testing**: **Vitest** + **Supertest** (19 automated integration tests)

---

## 📁 Project Structure

```text
shelfspace/
├── backend/
│   ├── src/
│   │   ├── config/              # Database connection & environment configuration
│   │   ├── db/                  # Drizzle ORM schema, migrations, connection pool
│   │   ├── middleware/          # Auth guards, validation, rate limiting, error handlers
│   │   ├── modules/
│   │   │   ├── auth/            # Auth controller, service, token rotation, sessions
│   │   │   ├── resources/       # Resource CRUD, Cheerio metadata extraction, classification
│   │   │   ├── projects/        # Project management & resource association
│   │   │   ├── collections/     # Collections & category organization
│   │   │   └── search/          # Search & multi-filter service
│   │   ├── scripts/             # Seed & data wipe utilities
│   │   ├── tests/               # Vitest integration test suite
│   │   ├── utils/               # SSRF validation, logger, response formatters
│   │   ├── app.ts               # Express application configuration
│   │   └── server.ts            # Server entry point & daily 30-day trash retention cleaner
│   ├── drizzle.config.ts        # Drizzle Kit configuration
│   ├── package.json
│   └── tsconfig.json
│
├── frontend/
│   ├── public/                  # Favicons, SVGs, and _redirects for SPA routing
│   ├── src/
│   │   ├── api/                 # Axios client with transparent 401 token refresh
│   │   ├── components/
│   │   │   ├── collections/     # Create & edit collection modals
│   │   │   ├── landing/         # Landing hero, features, FAQ, product tour
│   │   │   ├── layout/          # AppLayout, sidebar, top navigation
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

## 🚀 Getting Started

### 1. Prerequisites
- **Node.js** (v18 or higher recommended)
- **npm** (v9 or higher)
- A **PostgreSQL** database (e.g. [Neon](https://neon.tech), local PostgreSQL, or Supabase)

### 2. Installation

Clone the repository and install dependencies for both services:

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
DATABASE_URL=postgresql://user:password@endpoint.neon.tech/neondb?sslmode=require
JWT_ACCESS_SECRET=your_dev_jwt_access_secret_min_32_characters
JWT_REFRESH_SECRET=your_dev_jwt_refresh_secret_min_32_characters
ACCESS_TOKEN_EXPIRY=15m
REFRESH_TOKEN_EXPIRY=7d
FRONTEND_URL=http://localhost:5173
COOKIE_DOMAIN=
COOKIE_SAME_SITE=lax
COOKIE_SECURE=false
```

#### Frontend (`frontend/.env`):
```env
VITE_API_URL=/api
```

### 4. Database Setup & Migration

Push the schema to your PostgreSQL database using Drizzle Kit:

```bash
cd backend
npm run db:push
```

*(Optional)* Seed sample data and demo accounts:

```bash
npm run seed
```

Default demo account credentials:
- **Email:** `demo@shelfspace.dev`
- **Password:** `Password123!`

### 5. Running in Development

From the repository root:

```bash
# Terminal 1 — Backend (starts on http://localhost:5000)
npm run dev:backend

# Terminal 2 — Frontend (starts on http://localhost:5173)
npm run dev:frontend
```

---

## 🧪 Testing & Verification

Run the automated integration test suite (covers authentication, token refresh, SSRF protection, URL normalization, resource CRUD, ownership isolation, and session revocation):

```bash
# From root
npm run test:backend

# Or directly in backend
cd backend && npm test
```

Build verification:

```bash
# Build backend (TypeScript compilation)
cd backend && npm run build

# Build frontend (Vite production bundle)
cd ../frontend && npm run build
```

---

## 🌐 Production Deployment

### Recommended Deployment Architecture

- **Backend**: Long-running containerized Node.js service (e.g. **Render Web Service**, **Railway**, or **Fly.io**). The backend runs an Express server with active database connection pooling and an in-memory 24-hour cleanup job for expired trash items.
- **Frontend**: Static SPA hosting (e.g. **Vercel**, **Netlify**, or **Cloudflare Pages**). Pre-configured with SPA rewrites (`vercel.json` and `_redirects`).
- **Database**: Serverless PostgreSQL (**Neon**).

### Backend Deployment Steps (e.g. Render / Railway)

1. Connect your repository and select the `backend` directory (or set root directory to `backend`).
2. **Build Command:** `npm install && npm run build`
3. **Start Command:** `npm start` (runs `node dist/server.js`)
4. **Environment Variables:**
   - `NODE_ENV`: `production`
   - `PORT`: `5000` (or leave empty if assigned dynamically by the host)
   - `DATABASE_URL`: `postgresql://...neon.tech/neondb?sslmode=require`
   - `JWT_ACCESS_SECRET`: `<generated 64-char random string>`
   - `JWT_REFRESH_SECRET`: `<generated 64-char random string>`
   - `FRONTEND_URL`: `https://your-frontend-domain.vercel.app` (comma-separated if multiple)
   - `COOKIE_SAME_SITE`: `none` (if frontend and backend use different domains) or `lax` (if sharing a domain)
   - `COOKIE_SECURE`: `true`

### Frontend Deployment Steps (e.g. Vercel / Netlify)

1. Connect your repository and configure the root directory to `frontend`.
2. **Framework Preset:** Vite
3. **Build Command:** `npm run build`
4. **Output Directory:** `dist`
5. **Environment Variables:**
   - `VITE_API_URL`: `https://your-backend-api.onrender.com/api`
6. SPA routing rewrite rules are pre-configured in `frontend/vercel.json` and `frontend/public/_redirects`.

---

## 🩺 Health Check & Monitoring

The backend exposes an unauthenticated health check endpoint:

```http
GET /api/health
```

Example response:
```json
{
  "success": true,
  "message": "Shelfspace API is running smoothly",
  "data": {
    "status": "healthy",
    "timestamp": "2026-11-21T18:00:00.000Z",
    "uptime": 124.5,
    "environment": "production",
    "version": "1.0.0"
  }
}
```

---

## 🔒 Security Architecture

1. **SSRF Protection (`backend/src/utils/ssrf.ts`)**: Outbound metadata fetches resolve target hostnames before dispatching requests, blocking all loopback (`127.0.0.0/8`), private RFC1918 networks (`10.0.0.0/8`, `172.16.0.0/12`, `192.168.0.0/16`), link-local metadata addresses (`169.254.169.254`), and cloud provider internal metadata endpoints.
2. **HTTP-Only Cookies**: Access and refresh tokens are stored in `httpOnly`, `secure`, and `SameSite`-controlled cookies, preventing XSS-based token extraction.
3. **Session Revocation & Tracking**: Every user session tracks client User-Agent, IP address, and last active timestamp. Individual or bulk session revocation is supported.
4. **Tenant Data Ownership Isolation**: Every resource, project, and collection query strictly enforces the authenticated user ID at the database query level.
5. **Reverse Proxy Trust**: The backend enables `trust proxy` in production to correctly detect client IPs and enforce rate limits behind reverse proxies (Render, Cloudflare, AWS).
6. **Graceful Error Sanitization**: Internal 500 errors in production are sanitized to prevent database schema or stack trace leakage to clients.

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).
