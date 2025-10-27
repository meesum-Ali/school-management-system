# Backend (NestJS 10)

This package hosts the NestJS API that powers the School Management System. It follows the modular monolith guidelines described in `AGENTS.md` and `backend/DDD_MODULE_BOUNDARIES.md`.

## Tech Stack

- NestJS 10 (Express adapter)
- TypeORM 0.3 with PostgreSQL
- Passport JWT with Zitadel integration (`zitadel.strategy.ts`)
- Request-scoped multi-tenancy helpers (`core/tenant`)
- Jest unit/e2e tests (91/91 passing as of Phase 1 refactor)

## Scripts

```bash
npm run start        # start production build (requires dist/)
npm run start:dev    # watch mode with ts-node
npm run build        # compile to dist/
npm run test         # unit tests
npm run test:e2e     # end-to-end tests (uses test/jest-e2e.json)
npm run lint         # eslint across src, apps, libs, test
npm run migration:run  # execute TypeORM migrations via data-source.ts
```

## Environment Setup

1. Copy configuration:
   ```bash
   cp .env.example .env
   ```
2. Update mandatory values:
   - Database connection (defaults assume Docker `db` service).
   - `JWT_SECRET` for legacy auth fallback.
   - `ZITADEL_ISSUER`, `ZITADEL_CLIENT_ID`, `ZITADEL_JWKS_URI` (see `../ZITADEL_SETUP.md`).
3. Run the application:
   ```bash
   npm install
   npm run start:dev
   ```

## Testing

- `npm run test` executes the Jest unit suite.
- `npm run test:e2e` spins up e2e tests; ensure the database is available.
- Keep mocks aligned with service-layer boundaries—tests should never reach across modules via repositories.

## Project Structure Highlights

```
src/
├── auth/                # auth controller, local strategy, guards
├── classes/             # Classes module (service orchestrates SubjectsService)
├── core/
│   ├── database/        # TypeORM provider with tenant scoping
│   └── tenant/          # TenantProvider (request scoped)
├── schools/             # Tenant management
├── students/            # Students module (validates via ClassesService)
├── subjects/            # Subjects module
├── teachers/            # Teachers module
├── users/               # User management and roles
└── zitadel/             # Zitadel strategy, config, roles guard
```

Refer to `../MultiTenancyGuide.md` for required tenant checks and `../DevelopmentGuidelines.md` for coding standards.
