# AI Agent Contribution Guidelines

This repository contains a **Next.js 14 App Router** frontend and a **NestJS** backend written in TypeScript. The product goals and requirements are described in `PRD.md`.

## Architecture Overview

### Frontend
- **Framework**: Next.js 14 with App Router (file-based routing)
- **UI**: Material-UI 7 + Tailwind CSS
- **State Management**: TanStack Query (React Query) for server state
- **Authentication**: Zitadel OAuth/OIDC + local fallback
- **TypeScript**: Strict mode enabled

### Backend
- **Framework**: NestJS 10
- **Database**: PostgreSQL with TypeORM
- **Authentication**: Zitadel (JWT + JWKS validation)
- **API Documentation**: Swagger/OpenAPI
- **Multi-tenancy**: Organization-based (schoolId)

### Infrastructure
- **Containerization**: Docker Compose
- **Auth Provider**: Zitadel (self-hosted on port 8888)
- **Database**: PostgreSQL
- **API Gateway**: NestJS on port 5000
- **Frontend**: Next.js on port 3000

## General Principles
- Follow the architectural and coding conventions outlined in `DevelopmentGuidelines.md` and `CONTRIBUTING.md`
- Keep code modular and well documented. Prefer descriptive names and TypeScript types
- Ensure all changes include relevant tests when possible
- Use TanStack Query hooks for all API interactions
- Follow Next.js App Router conventions (server components by default, 'use client' when needed)
- Maintain multi-tenancy awareness in all backend services

## Development Setup

### Prerequisites
```bash
# Install dependencies
docker-compose up -d db zitadel
cd backend && npm install && cd ..
cd frontend && npm install && cd ..
```

### Environment Variables
Copy example files and configure:
```bash
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env.local
```

See `ZITADEL_SETUP.md` for Zitadel configuration steps.

## Programmatic Checks
Run the following before committing:

```bash
# Backend
cd backend
npm install
npm run lint
npm run build
npm test
cd ..

# Frontend
cd frontend
npm install
npm run lint
npm run build
cd ..
```

## Code Quality Standards

### Backend
- Use DTOs for all request/response validation
- Apply `@UseGuards(AuthGuard('zitadel'), RolesGuard)` to protected routes
- Use `@Public()` decorator for public endpoints
- Filter data by `schoolId` for multi-tenant isolation
- Write unit tests for services
- Write e2e tests for controllers

### Frontend
- Use TanStack Query hooks (no manual useState/useEffect for API calls)
- Create custom hooks in `hooks/` directory for all resources
- Server components by default; add `'use client'` only when needed
- Handle loading and error states consistently
- Use TypeScript interfaces from `types/` directory

## Authentication & Authorization

### Zitadel Integration
- JWT tokens validated using JWKS endpoint
- Roles: `SUPER_ADMIN`, `SCHOOL_ADMIN`, `TEACHER`, `STUDENT`
- Organizations map to schools (schoolId)
- Both OAuth and local auth supported

### Protected Routes
```typescript
@Controller('resource')
@UseGuards(AuthGuard('zitadel'), RolesGuard)
export class ResourceController {
  @Get()
  @Roles(UserRole.SCHOOL_ADMIN)
  findAll(@Req() req) {
    // Access user via req.user
    // Filter by req.user.schoolId for multi-tenancy
  }
}
```

## Multi-Tenancy Guidelines

### Backend
- Always filter queries by `schoolId` for SCHOOL_ADMIN users
- SUPER_ADMIN can access all data
- Store `schoolId` in entities where applicable
- Validate user has access to requested resources

### Frontend
- Display only user's organization data
- Handle organization context in AuthContext
- Filter dropdowns and selectors by user's school

## Testing

### Backend Tests
```bash
cd backend
npm test                    # Unit tests
npm run test:e2e            # E2E tests
npm run test:cov            # Coverage report
```

### Frontend Tests (when implemented)
```bash
cd frontend
npm test
```

## Database Migrations

```bash
cd backend
npm run migration:generate -- src/migrations/DescriptiveName
npm run migration:run
```

## API Documentation

Swagger available at: `http://localhost:5000/api-docs`

## Common Tasks

### Adding a New Resource

1. **Backend**:
   ```bash
   cd backend/src
   nest g resource resource-name
   ```
   - Add DTOs with validation
   - Implement service with multi-tenancy
   - Add guards and roles to controller
   - Write tests

2. **Frontend**:
   ```bash
   cd frontend
   # Create hook file
   touch hooks/useResourceName.ts
   # Create page
   mkdir -p app/admin/resource-name
   touch app/admin/resource-name/page.tsx
   ```
   - Implement TanStack Query hooks
   - Create list/create/edit pages
   - Add navigation in Sidebar

### Debugging

```bash
# View logs
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f zitadel

# Check service health
curl http://localhost:5000/api/health
curl http://localhost:8888/.well-known/openid-configuration
```

## Pull Requests
- Use clear commit messages following conventional commits (feat:, fix:, docs:, etc.)
- Update documentation when behaviour changes
- Ensure PRs pass all programmatic checks
- Include screenshots for UI changes
- Reference related issues
- Test authentication flows if touching auth code
- Verify multi-tenancy isolation if touching data access

## Important Files
- `PRD.md` - Product requirements
- `ZITADEL_SETUP.md` - Authentication setup guide
- `DevelopmentGuidelines.md` - Coding standards
- `CONTRIBUTING.md` - Contribution process
- `MultiTenancyGuide.md` - Multi-tenancy architecture
- `docker-compose.yml` - Infrastructure setup

## Resources
- [Next.js App Router Docs](https://nextjs.org/docs/app)
- [NestJS Docs](https://docs.nestjs.com)
- [TanStack Query Docs](https://tanstack.com/query/latest)
- [Zitadel Docs](https://zitadel.com/docs)
- [TypeORM Docs](https://typeorm.io)

