# Shelfspace — Developer Resource Management Workspace

> A personal workspace for collecting, organizing, discovering, and reusing resources while building software.

Shelfspace brings scattered developer resources (repositories, UI components, icon sets, color palettes, APIs, documentation, and code snippets) into one unified, searchable library and connects them directly to the projects and collections where they are used.

---

## 🎨 Design Direction & References

Designed with a high-craft developer tool aesthetic (inspired by **[Lineicons](https://lineicons.com/)**, **[21st.dev](https://21st.dev/)**, and top **[Dribbble](https://dribbble.com/)** dev consoles) while strictly avoiding generic AI-generated aesthetic tropes:
- **Clean neutral zinc & obsidian palette** with crisp borders (`border-zinc-200/80` and `border-zinc-800/80`), subtle elevations, and dark/light themes.
- **Type-aware presentations**:
  - **Design**: Interactive color palettes with click-to-copy hex swatches and font previews.
  - **UI**: Component directories, framework pills, icon library tags (e.g. Lineicons, 21st.dev).
  - **Development**: Real-time GitHub stats (language dot, stars, forks, licenses).
  - **Data**: REST/GraphQL method badges, endpoints, and auth requirements.
  - **Learning**: Platform tags and estimated reading times.
  - **Personal**: Monospace code snippets and markdown notes.
- **Micro-interactions & Shortcuts**:
  - `⌘K` or `Ctrl+K`: Global command search palette.
  - `N`: Quick Add drawer from anywhere in the application.
  - One-click copy for URLs, color hex codes, and GitHub clone URLs.

---

## 🛠 Tech Stack

### Frontend
- **React 19** + **TypeScript**
- **Vite 8** with `@tailwindcss/vite` (Tailwind CSS v4)
- **Lucide Icons** (clean, crisp, Lineicons-compatible vectors)
- **React Router v7** (protected authentication routes, nested layouts)
- **Axios** (centralized API client with automatic token refresh)
- **TanStack Query** (asynchronous server-state management)
- **Zod** (frontend schema validation)

### Backend
- **Node.js** + **Express.js** + **TypeScript**
- **MongoDB** + **Mongoose** (compound indexes, text search, TTL session indexes)
- **Zod** (runtime validation middleware for request bodies and queries)
- **HTTP-Only Cookies** (`access_token` and `refresh_token` with session rotation)
- **Cheerio** + **Safe Fetch** (SSRF-protected URL metadata extraction & OpenGraph parser)
- **Security**: Helmet, CORS, Express-Rate-Limit, DNS resolution IP check.
- **Testing**: **Vitest** + **Supertest** (100% automated integration test coverage).

---

## 📁 Repository Structure

```text
project-1/
├── backend/
│   ├── src/
│   │   ├── config/              # Database connection & environment configuration
│   │   ├── middleware/          # Auth guards, validation, error handler, rate limiters
│   │   ├── modules/
│   │   │   ├── auth/            # User model, Session model, token rotation, auth controllers
│   │   │   ├── resources/       # Resource model, metadata extractor (Cheerio + GitHub API), CRUD
│   │   │   ├── projects/        # Project model & resource association service
│   │   │   ├── collections/     # Collection model & custom color themes
│   │   │   └── search/          # Full text search & multi-filter query service
│   │   ├── scripts/             # Database seeder
│   │   ├── tests/               # Vitest automated integration tests
│   │   ├── utils/               # SSRF protection, logger, token generator, API responses
│   │   ├── app.ts               # Express application configuration
│   │   └── server.ts            # Server entry point & daily 30-day trash retention cleaner
│   ├── package.json
│   └── tsconfig.json
│
├── frontend/
│   ├── src/
│   │   ├── api/                 # Axios client with 401 transparent token refresh
│   │   ├── components/
│   │   │   ├── layout/          # AppLayout, collapsible sidebar, top navigation
│   │   │   ├── resources/       # ResourceCard (grid & list), QuickAddDrawer, EditModal
│   │   │   ├── search/          # CommandPalette (Cmd+K modal)
│   │   │   └── ui/              # Button, Input, Badge, Dialog, Drawer, DeleteConfirmModal
│   │   ├── context/             # AuthContext, ThemeContext (system/dark/light)
│   │   ├── lib/                 # Utility functions (cn, date formatters)
│   │   ├── pages/               # Auth, Library, ResourceDetail, Projects, Collections, Favourites, Trash, Settings
│   │   ├── types/               # TypeScript schemas
│   │   ├── App.tsx              # Application router & route guards
│   │   ├── index.css            # Tailwind layers & custom theme CSS variables
│   │   └── main.tsx             # Root entry point
│   ├── package.json
│   └── vite.config.ts
│
└── package.json                 # Root orchestration scripts
```

---

## 🚀 Getting Started

### 1. Prerequisites
- **Node.js** (v18+)
- **MongoDB** running locally on `mongodb://127.0.0.1:27017` (or MongoDB Atlas)

### 2. Quick Setup

```bash
# Seed demo resources and accounts
npm run seed

# Run backend development server (starts on http://localhost:5000)
npm run dev:backend

# Run frontend development server (starts on http://127.0.0.1:5173)
npm run dev:frontend
```

### 3. Default Demo Account
- **Email:** `demo@shelfspace.dev`
- **Password:** `Password123!`

---

## 🧪 Automated Testing

Run the full integration test suite covering health checks, SSRF filtering, URL normalization, user authentication, session rotation, per-user duplicate detection, cross-user isolation, and project safe deletion:

```bash
npm run test:backend
```

Result:
```text
✓ src/tests/api.test.ts (11 tests)
  ✓ Health Check returns status healthy
  ✓ SSRF Protection & URL Normalization (3 tests)
  ✓ Authentication & Session Flow (3 tests)
  ✓ Resources & Ownership Isolation (4 tests)

Test Files  1 passed (1)
Tests       11 passed (11)
```

---

## 🔒 Security Measures Implemented

1. **SSRF Guard (`src/utils/ssrf.ts`)**: Resolves target hostnames before making outbound requests and strictly blocks loopback (`127.0.0.0/8`), private networks (`10.0.0.0/8`, `172.16.0.0/12`, `192.168.0.0/16`), and link-local addresses (`169.254.0.0/16`).
2. **HTTP-Only Cookie Authentication**: Access and refresh tokens are stored exclusively in HTTP-only, SameSite cookies to protect against XSS token harvesting.
3. **Session Revocation & Tracking**: Every active device session is logged with IP, device agent, and last active timestamp. Users can inspect and revoke individual sessions or all other devices in Settings.
4. **Data Ownership Isolation**: Every resource, project, and collection query strictly enforces the authenticated user's ID.
5. **Safe Association Semantics**: Deleting a project or collection retains all associated resources while cleanly removing the foreign key references.
6. **30-Day Trash & Account Retention**: Trashed resources are held for 30 days before permanent purging. Deactivated accounts have a 30-day reactivation grace period.
