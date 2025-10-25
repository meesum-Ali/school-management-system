# AI Agent Contribution Guidelines

_Last reviewed: 2024-10-15 (AI agent audit)_

This repository delivers a Next.js 14 frontend and a NestJS 10 backend. The stated goal is a DDD-aligned, clean, and scalable platform. The points below capture the current implementation realities and the guardrails agents **must** respect while iterating toward that goal.

## Repository Snapshot
- **Frontend**: Next.js 14 App Router, TypeScript (strict), React Query (TanStack), Material UI 7, Tailwind, custom Auth context
- **Backend**: NestJS 10, TypeORM targeting PostgreSQL, resource-first modules (students, classes, etc.), Swagger docs, request-scoped multi-tenant helpers
- **Auth**: Zitadel OIDC (JWT, JWKS) plus legacy local login fallback
- **Tooling**: Docker Compose for Postgres + Zitadel, Jest unit tests (selected services), lint/build/test npm scripts per package
- **Notable repos state**: `backend/dist/` and `node_modules/` folders are committed; revisit when adjusting CI/CD expectations

## Backend Review
- **Architecture**: Modules are generated via `nest g resource` and follow controller → service → TypeORM repository flow. There is **no explicit domain/application/infrastructure separation yet**; domain logic, DTO mapping, and persistence concerns are blended inside services (for example `students.service.ts`, `classes.service.ts`).
- **Domain model**: TypeORM entities double as domain entities and are enriched with validation decorators (`students/entities/student.entity.ts`, `users/entities/user.entity.ts`). This mixes persistence and validation responsibilities and makes future domain evolution harder.
- **Authentication & authorization**:
  - `ZitadelStrategy` returns role maps, but controllers rely on `RolesGuard` that expects string arrays (`students.controller.ts`), leading to inconsistent role enforcement.
  - `TenantProvider` reads `user.tenant` while most controllers expect `req.user.schoolId`; resolve this discrepancy before adding more tenant logic.
- **Cross-cutting concerns**: Services perform synchronous console logging and manual DTO conversions. Consider introducing dedicated mappers and a structured logger once domain/application layers exist.
- **Testing**: Only select services have unit coverage (e.g. `students.service.spec.ts`). Controller-level, domain-level, and multi-tenant guard tests are largely missing.

## Frontend Review
- **Client/server split**: Critical providers (`ReactQueryProvider`, `AuthProvider`) are client components, which is appropriate for the current setup. Pages that depend on React Query are marked `'use client'`.
- **API access**: `lib/api.ts` centralizes Axios configuration and injects tokens from `localStorage`. Because this file can be imported by server code, always gate `localStorage` usage or refactor to a client-only accessor to avoid SSR crashes.
- **State & types**: Hooks in `hooks/` wrap API calls with cache invalidation. DTO/types mirror backend shapes but still reflect persistence concerns; plan on introducing domain-facing view models when backend adopts DDD layers.
- **UX & layout**: Admin pages use `AdminLayout` and simple loading/error placeholders. Standardize loading/error components when expanding feature set.

## DDD & Clean Architecture Direction
- Adopt a layered structure per bounded context (`/domain`, `/application`, `/infrastructure`):
  1. **Domain**: Pure aggregates, value objects, domain services that encapsulate invariants (e.g., `Student`, `Class`, `School` aggregates with `SchoolId`, `Email` value objects). No NestJS or TypeORM imports here.
  2. **Application**: Use cases orchestrating domain objects, handling transactions, and exposing DTOs. Keep mapping logic here.
  3. **Infrastructure**: NestJS modules, controllers, TypeORM entities/repositories, mappers, and adapters that fulfill application contracts.
- Move validation concerns to DTOs (`class-validator`) and keep entities free of presentation constraints.
- Define a translation layer that normalizes Zitadel roles into `UserRole[]` once and shares it between backend guards and frontend auth context.
- Wrap multi-tenant context (schoolId) in a dedicated request-scoped service backed by clear contracts so guards/controllers do not duplicate lookups.
- Introduce domain-level tests (aggregate invariants), application-level tests (use case flows), and integration tests that include auth + multi-tenancy boundaries.

## Actionable Focus for Agents
1. **Align auth roles**: Create a mapper that converts Zitadel role claims to the internal `UserRole` enum and swap controllers to a single guard.
2. **Decouple validation from entities**: Migrate validation decorators from TypeORM entities to DTOs and enforce invariants through domain constructors.
3. **Introduce domain models incrementally**: Start with the most mature module (`students` or `classes`), extracting aggregates and value objects while keeping existing controllers functional via adapters.
4. **Harmonize tenant context**: Standardize on `schoolId` everywhere; update `TenantProvider` and guards to enforce it.
5. **Testing**: Extend existing Jest suites to cover authorization paths and domain rules before large refactors.
6. **Repository hygiene**: Plan to drop `dist/` and `node_modules/` from version control once CI pipelines or build steps can recreate them deterministically.

## Workflow Notes
- Keep following `DevelopmentGuidelines.md`, `CONTRIBUTING.md`, and `MultiTenancyGuide.md` for coding standards and review requirements.
- Run the documented lint/build/test scripts for both frontend and backend before submitting changes.
- Use Docker Compose to bring up Postgres and Zitadel locally (`docker-compose up -d db zitadel`).
- Environment: copy `.env.example` files, configure Zitadel according to `ZITADEL_SETUP.md`, and set `NEXT_PUBLIC_API_URL` for frontend builds.

## Reference Library
- PRD.md — product direction and feature scope
- DevelopmentGuidelines.md — coding conventions
- MultiTenancyGuide.md — tenant isolation strategy
- Zitadel docs — https://zitadel.com/docs
- NestJS docs — https://docs.nestjs.com
- Next.js App Router docs — https://nextjs.org/docs/app

Agents should treat the checklist above as the baseline truth when evaluating new changes. Call out deviations early, enforce DDD boundaries as they are introduced, and keep the documentation in sync with actual implementation.
