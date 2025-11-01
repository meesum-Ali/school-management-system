![License](https://img.shields.io/github/license/meesum-Ali/school-management-system)
![Issues](https://img.shields.io/github/issues/meesum-Ali/school-management-system)
![Next.js](https://img.shields.io/badge/Next.js-16-black)
![NestJS](https://img.shields.io/badge/NestJS-10-red)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)
[![zread](https://img.shields.io/badge/Ask_Zread-_.svg?style=flat&color=00b0aa&labelColor=000000&logo=data%3Aimage%2Fsvg%2Bxml%3Bbase64%2CPHN2ZyB3aWR0aD0iMTYiIGhlaWdodD0iMTYiIHZpZXdCb3g9IjAgMCAxNiAxNiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTQuOTYxNTYgMS42MDAxSDIuMjQxNTZDMS44ODgxIDEuNjAwMSAxLjYwMTU2IDEuODg2NjQgMS42MDE1NiAyLjI0MDFWNC45NjAxQzEuNjAxNTYgNS4zMTM1NiAxLjg4ODEgNS42MDAxIDIuMjQxNTYgNS42MDAxSDQuOTYxNTZDNS4zMTUwMiA1LjYwMDEgNS42MDE1NiA1LjMxMzU2IDUuNjAxNTYgNC45NjAxVjIuMjQwMUM1LjYwMTU2IDEuODg2NjQgNS4zMTUwMiAxLjYwMDEgNC45NjE1NiAxLjYwMDFaIiBmaWxsPSIjZmZmIi8%2BCjxwYXRoIGQ9Ik00Ljk2MTU2IDEwLjM5OTlIMi4yNDE1NkMxLjg4ODEgMTAuMzk5OSAxLjYwMTU2IDEwLjY4NjQgMS42MDE1NiAxMS4wMzk5VjEzLjc1OTlDMS42MDE1NiAxNC4xMTM0IDEuODg4MSAxNC4zOTk5IDIuMjQxNTYgMTQuMzk5OUg0Ljk2MTU2QzUuMzE1MDIgMTQuMzk5OSA1LjYwMTU2IDE0LjExMzQgNS42MDE1NiAxMy43NTk5VjExLjAzOTlDNS42MDE1NiAxMC42ODY0IDUuMzE1MDIgMTAuMzk5OSA0Ljk2MTU2IDEwLjM5OTlaIiBmaWxsPSIjZmZmIi8%2BCjxwYXRoIGQ9Ik0xMy43NTg0IDEuNjAwMUgxMS4wMzg0QzEwLjY4NSAxLjYwMDEgMTAuMzk4NCAxLjg4NjY0IDEwLjM5ODQgMi4yNDAxVjQuOTYwMUMxMC4zOTg0IDUuMzEzNTYgMTAuNjg1IDUuNjAwMSAxMS4wMzg0IDUuNjAwMUgxMy43NTg0QzE0LjExMTkgNS42MDAxIDE0LjM5ODQgNS4zMTM1NiAxNC4zOTg0IDQuOTYwMVYyLjI0MDFDMTQuMzk4NCAxLjg4NjY0IDE0LjExMTkgMS42MDAxIDEzLjc1ODQgMS42MDAxWiIgZmlsbD0iI2ZmZiIvPgo8cGF0aCBkPSJNNCAxMkwxMiA0TDQgMTJaIiBmaWxsPSIjZmZmIi8%2BCjxwYXRoIGQ9Ik00IDEyTDEyIDQiIHN0cm9rZT0iI2ZmZiIgc3Ryb2tlLXdpZHRoPSIxLjUiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIvPgo8L3N2Zz4K&logoColor=ffffff)](https://zread.ai/meesum-Ali/school-management-system)
![Contributors](https://img.shields.io/github/contributors/meesum-Ali/school-management-system)

# School Management System

A modern, multi-tenant school management platform built with a Next.js 16 frontend and a NestJS 10 backend. The codebase targets Domain-Driven Design (DDD) boundaries, enforces strict tenant isolation, and uses Zitadel for authentication.

## Key Capabilities

- Multi-tenant data model keyed by `schoolId` with request-scoped enforcement.
- Role-based access control via Zitadel roles (`SUPER_ADMIN`, `SCHOOL_ADMIN`, `TEACHER`, `STUDENT`) plus a legacy local login fallback.
- Modular NestJS services with service-layer orchestration and 90+ Jest tests.
- Next.js App Router client with Material UI, Tailwind CSS, and TanStack Query for a responsive admin experience.
- Docker Compose stack including Postgres, Zitadel, backend, frontend, nginx reverse proxy, and pgAdmin.

## Architecture Snapshot

### Frontend
- Next.js 16 App Router (React 18, strict TypeScript).
- Global providers for authentication, theming, and TanStack Query configured in `app/layout.tsx`.
- Axios client in `lib/api.ts` that injects bearer tokens client-side only.
- Auth context normalises Zitadel and legacy JWT claims into a consistent `user` shape.

### Backend
- NestJS 10 modular monolith with clear service interfaces per bounded context.
- TypeORM 0.3 mapped to PostgreSQL with tenant-aware repositories.
- Request-scoped `TenantProvider` and guards that apply RBAC and tenancy rules.
- Swagger/OpenAPI docs, health checks, and Jest unit tests (91/91 passing).

### Infrastructure
- Docker Compose orchestrates Postgres, Zitadel, backend, frontend, nginx, and pgAdmin.
- Nginx proxies traffic to the backend and frontend containers.
- Environment management via `.env` / `.env.local` files per package.

## Documentation

- [`DOCUMENTATION_INDEX.md`](DOCUMENTATION_INDEX.md) — overview of available documentation.
- [`DevelopmentGuidelines.md`](DevelopmentGuidelines.md) — coding conventions and DDD direction.
- [`AGENTS.md`](AGENTS.md) — project reality check and agent guardrails.
- [`MultiTenancyGuide.md`](MultiTenancyGuide.md) — tenant isolation rules and patterns.
- [`ZITADEL_SETUP.md`](ZITADEL_SETUP.md) — local and production Zitadel configuration.
- [`PRD.md`](PRD.md) — product requirements and roadmap.

## Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/meesum-Ali/school-management-system.git
cd school-management-system
```

### 2. Run the Full Stack with Docker (recommended)

```bash
docker-compose up -d
```

Services and defaults:

- Frontend (Next.js): http://localhost:3000
- Backend API (NestJS): http://localhost:5000/api
- Swagger UI: http://localhost:5000/api-docs
- Zitadel console: http://localhost:8888/ui/console
- pgAdmin: http://localhost:8080

Follow the [`ZITADEL_SETUP.md`](ZITADEL_SETUP.md) guide to configure roles and applications.

### 3. Manual Setup

#### Backend

```bash
cd backend
npm install
cp .env.example .env   # configure database + Zitadel values
npm run migration:run  # optional if starting from an empty database
npm run start:dev
```

The API is served at http://localhost:5000.

#### Frontend

```bash
cd frontend
npm install
cp .env.example .env.local   # set NEXT_PUBLIC_* environment variables
npm run dev
```

The app runs at http://localhost:3000 by default. Override the port using `PORT=3001 npm run dev`.

## Environment Variables

Set the following minimum configuration (see the `.env.example` files for the full list):

```env
# backend/.env
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_USER=postgres
DATABASE_PASSWORD=postgres
DATABASE_NAME=sms_db

JWT_SECRET=change-me
JWT_EXPIRATION=3600s

ZITADEL_ISSUER=http://localhost:8888
ZITADEL_CLIENT_ID=<client-id>
ZITADEL_JWKS_URI=http://localhost:8888/oauth/v2/keys

# frontend/.env.local
NEXT_PUBLIC_API_URL=http://localhost:5000/api
NEXT_PUBLIC_ZITADEL_ISSUER=http://localhost:8888
NEXT_PUBLIC_ZITADEL_CLIENT_ID=<client-id>
NEXT_PUBLIC_ZITADEL_REDIRECT_URI=http://localhost:3000/auth/callback
```

## Project Layout

```
school-management-system/
├── README.md
├── AGENTS.md
├── DOCUMENTATION_INDEX.md
├── DevelopmentGuidelines.md
├── MultiTenancyGuide.md
├── PRD.md
├── ZITADEL_SETUP.md
├── backend/
│   ├── src/
│   │   ├── auth/
│   │   ├── classes/
│   │   ├── core/tenant/
│   │   ├── students/
│   │   └── ...
│   ├── test/
│   └── package.json
├── frontend/
│   ├── app/
│   ├── components/
│   ├── hooks/
│   ├── lib/
│   ├── proxy.ts
│   └── package.json
├── docker-compose.yml
└── nginx/nginx.conf
```

## Testing & Quality

- Backend unit tests: `cd backend && npm run test`
- Backend e2e tests: `cd backend && npm run test:e2e`
- Backend linting: `cd backend && npm run lint`
- Frontend linting: `cd frontend && npm run lint`

Treat any failing tests as blockers before committing. The existing suite (91/91) covers the refactored module boundaries.

## Authentication & Tenancy

- Zitadel handles OIDC login. Tokens are validated against the configured JWKS and translated into `req.user`.
- The `TenantProvider` exposes the current tenant to request-scoped services. Pass the derived `schoolId` into service methods and apply it to TypeORM queries.
- See [`MultiTenancyGuide.md`](MultiTenancyGuide.md) for mandatory patterns and [`ZITADEL_SETUP.md`](ZITADEL_SETUP.md) for identity configuration.
- A legacy local JWT login remains available for development; it populates the same `user` shape consumed by guards.

## Contributing

Review [`DevelopmentGuidelines.md`](DevelopmentGuidelines.md) and [`CONTRIBUTING.md`](CONTRIBUTING.md) before raising pull requests. Respect the service-layer boundaries, keep tenant checks in place, and extend docs when behaviour changes.
