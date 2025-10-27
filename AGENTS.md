# AI Agent Contribution Guidelines

_Last reviewed: 2025-10-27 (Phase 1 DDD Refactoring Complete)_

This repository delivers a Next.js 16 frontend and a NestJS 10 backend. The stated goal is a DDD-aligned, clean, and scalable platform. The points below capture the current implementation realities and the guardrails agents **must** respect while iterating toward that goal.

## Repository Snapshot
- **Frontend**: Next.js 16 App Router, TypeScript (strict), React Query (TanStack), Material UI 7, Tailwind, custom Auth context
- **Backend**: NestJS 10, TypeORM targeting PostgreSQL, resource-first modules (students, classes, etc.), Swagger docs, request-scoped multi-tenant helpers
- **Auth**: Zitadel OIDC (JWT, JWKS) plus legacy local login fallback
- **Tooling**: Docker Compose for Postgres + Zitadel, Jest unit tests (91/91 passing), lint/build/test npm scripts per package
- **Infrastructure**: Nginx reverse proxy for static file serving and API routing
- **Notable repos state**: `backend/dist/` and `node_modules/` folders are committed; revisit when adjusting CI/CD expectations

## Backend Review - Post Phase 1 Refactoring ✅

### Architecture Status: Well-Structured Modular Monolith
- **Module Boundaries**: ✅ COMPLETE - All modules now communicate through service layer, not direct repository access
- **Circular Dependencies**: ✅ ELIMINATED - Zero circular dependencies remaining
- **Service Layer**: ✅ ESTABLISHED - Domain service interfaces defined in `common/interfaces/domain-services.interface.ts`
- **Aggregate Boundaries**: ✅ RESPECTED - Cross-module operations use service layer validation
- **Testing**: ✅ COMPLETE - 91/91 tests passing, all affected tests updated for new architecture

### Phase 1 Accomplishments (Oct 2025)
1. **StudentsModule** - Removed ClassEntity repository injection, added ClassesService dependency
2. **ClassesModule** - Removed SubjectEntity repository injection, added SubjectsService dependency, query builder for relationships
3. **Circular Dependencies** - Eliminated AuthModule ↔ SchoolsModule, ClassesModule ↔ ClassScheduleModule
4. **Test Suite** - Updated all test mocks to use service layer instead of repository cross-access
5. **Documentation** - Created `DDD_MODULE_BOUNDARIES.md` (Phase 1 report archived but key notes retained in this file)

### Current Architecture Patterns

**✅ DO (Established Patterns):**
```typescript
// Service layer communication
constructor(
  @InjectRepository(Student)
  private readonly studentsRepository: Repository<Student>,
  private readonly classesService: ClassesService, // ✅ Service layer
) {}

// Validate through service layer
await this.classesService.findOne(classId, schoolId);

// Query builder for relationships
await this.classesRepository
  .createQueryBuilder()
  .relation(ClassEntity, 'subjects')
  .of(classId)
  .add(subjectId);
```

**❌ DON'T (Anti-patterns):**
```typescript
// Direct repository cross-access
@InjectRepository(ClassEntity)
private classesRepository: Repository<ClassEntity>; // ❌

// Loading full entities for relationships
const classEntity = await this.classesRepository.findOne(...);
classEntity.subjects.push(subject); // ❌

// Circular dependencies
@Module({
  imports: [forwardRef(() => OtherModule)], // ❌
})
```

### Remaining Technical Debt
- **Domain/Application/Infrastructure separation**: Services still blend these concerns; plan layered refactoring
- **TypeORM entities as domain models**: Entities still have validation decorators; migrate to DTOs
- **Authentication role mapping**: Zitadel roles need normalization to internal UserRole enum
- **Tenant context**: Harmonize `user.tenant` vs `req.user.schoolId` discrepancy
- **Structured logging**: Replace console.log with proper logger service

## Frontend Review
- **Client/server split**: Critical providers (`ReactQueryProvider`, `AuthProvider`) are client components, which is appropriate for the current setup. Pages that depend on React Query are marked `'use client'`.
- **API access**: `lib/api.ts` centralizes Axios configuration and injects tokens from `localStorage`. Because this file can be imported by server code, always gate `localStorage` usage or refactor to a client-only accessor to avoid SSR crashes.
- **State & types**: Hooks in `hooks/` wrap API calls with cache invalidation. DTO/types mirror backend shapes but still reflect persistence concerns; plan on introducing domain-facing view models when backend adopts DDD layers.
- **UX & layout**: Admin pages use `AdminLayout` and simple loading/error placeholders. Standardize loading/error components when expanding feature set.

## DDD & Clean Architecture Direction (Phases 2+)

### Phase 2: Event-Driven Communication (Planned)
- Introduce event bus (RabbitMQ/Kafka)
- Replace synchronous service calls with async events
- Implement saga pattern for distributed transactions
- Add domain event sourcing for critical aggregates

### Phase 3: Full DDD Layers (Planned)
- Adopt a layered structure per bounded context (`/domain`, `/application`, `/infrastructure`):
  1. **Domain**: Pure aggregates, value objects, domain services that encapsulate invariants (e.g., `Student`, `Class`, `School` aggregates with `SchoolId`, `Email` value objects). No NestJS or TypeORM imports here.
  2. **Application**: Use cases orchestrating domain objects, handling transactions, and exposing DTOs. Keep mapping logic here.
  3. **Infrastructure**: NestJS modules, controllers, TypeORM entities/repositories, mappers, and adapters that fulfill application contracts.
- Move validation concerns to DTOs (`class-validator`) and keep entities free of presentation constraints.

### Phase 4: Microservices Extraction (Future)
- Each module becomes a deployable microservice
- Separate database per service
- API gateway for routing
- Service mesh for inter-service communication

## Actionable Focus for Agents

### High Priority (Post Phase 1)
1. **Align auth roles**: Create a mapper that converts Zitadel role claims to the internal `UserRole` enum and swap controllers to a single guard.
2. **Harmonize tenant context**: Standardize on `schoolId` everywhere; update `TenantProvider` and guards to enforce it.
3. **Structured logging**: Replace console.log with NestJS Logger service across all modules.

### Medium Priority
4. **Decouple validation from entities**: Migrate validation decorators from TypeORM entities to DTOs and enforce invariants through domain constructors.
5. **Domain models**: Start with the most mature module (`students` or `classes`), extracting aggregates and value objects while keeping existing controllers functional via adapters.
6. **Controller tests**: Add controller-level tests covering authorization paths and multi-tenancy.

### Low Priority
7. **Repository hygiene**: Plan to drop `dist/` and `node_modules/` from version control once CI pipelines or build steps can recreate them deterministically.
8. **Frontend view models**: Introduce domain-facing types separate from DTOs when backend layers are established.

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
