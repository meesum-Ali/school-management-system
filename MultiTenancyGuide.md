# Multi-Tenancy Guide

This project runs as a multi-tenant SaaS platform where every authenticated request is scoped to a single school. Use this guide to understand how tenancy is expressed in the codebase and how to keep new features aligned with that contract.

## Tenant Identity

- Each **school** is treated as a tenant. In the database every aggregate that belongs to a school carries a `school_id` column (exposed in code as `schoolId`).
- Zitadel tokens include the tenant context. The current implementation exposes it as:
  - `urn:zitadel:iam:org:id` for Zitadel-issued JWTs
  - `schoolId` for locally issued JWTs
  - `tenant` on the Express request via `TenantProvider` (still using legacy naming; plan to align completely on `schoolId`).
- Frontend code collapses those claims inside the `AuthProvider`, normalising them into `user.schoolId`.

## Backend Responsibilities

1. **Extract the tenant**  
   Controllers obtain the current tenant from `req.user`. If you need it outside of controllers, inject `TenantProvider` from `backend/src/core/tenant` (request scoped) which presently reads `request.user.tenant`. When you add new code prefer `schoolId` and keep an eye on the planned provider rename.

2. **Guard every query**  
   Services receive `schoolId` as an explicit parameter. Never query without applying `where: { schoolId }` (or the equivalent for query builders). If you write reusable repository helpers, require the tenant as an argument.

3. **Surface tenant violations early**  
   - Throw `NotFoundException` when a resource is missing within the tenant scope instead of leaking cross-tenant identifiers.
   - When joining aggregates (e.g. assigning a student to a class), validate the referenced aggregate through the owning module’s service before touching relationships.

4. **Testing**  
   Unit tests should pass a fake `schoolId` into services and assert that repositories are called with the same discriminator. For integration tests seed fixtures per tenant to ensure isolation.

## Frontend Responsibilities

1. **Tenant-aware Auth state**  
   The `AuthProvider` decodes the JWT, stores the school identifier, and exposes it to components via context. When calling backend APIs always include the bearer token; the backend derives tenancy from it.

2. **Routing and UX**  
   - Guard client routes with the role-aware logic that already exists in `proxy.ts` and the Auth context.
   - When a screen can operate on multiple schools (e.g. SUPER_ADMIN dashboards), make the tenant explicit in the UI and require the backend endpoint to accept either a `schoolId` query param or a special admin route.

3. **Caching**  
   TanStack Query keys should include `schoolId` when data is tenant-specific to avoid cache pollution across tenants during role switching.

## Operational Checklist

- [ ] New entities include a `schoolId` column (nullable only when truly global).
- [ ] DTOs accept, but controllers **do not trust**, incoming `schoolId`; prefer to override with the authenticated tenant.
- [ ] Guards and interceptors do not mutate tenant context silently.
- [ ] Background jobs or scheduled tasks receive tenant identifiers explicitly—do not reuse request-scoped providers.
- [ ] Observability (logs, metrics) emits the tenant identifier for traceability.

Keeping these rules in place ensures we maintain hard data boundaries between schools today and remain ready for the future DDD refactor that will separate domain/application/infrastructure layers.
