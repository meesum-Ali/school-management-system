# 📚 School Management System - Complete Documentation Index

Welcome to the comprehensive documentation for your School Management System. This index will guide you to the right document based on what you need.

---

## 🎯 Quick Navigation

### For Understanding the System
- 📖 **[PROJECT_ARCHITECTURE_GUIDE.md](./PROJECT_ARCHITECTURE_GUIDE.md)** - Complete system architecture, patterns, and end-to-end explanation
- 🎨 **[VISUAL_DIAGRAMS.md](./VISUAL_DIAGRAMS.md)** - Visual representations of data flows, authentication, and system layers

### For Development
- ✅ **[QUICK_START_CHECKLIST.md](./QUICK_START_CHECKLIST.md)** - Step-by-step checklist for adding new features/modules
- 🤖 **[AGENTS.md](./AGENTS.md)** - AI agent guidelines and current implementation audit
- 📝 **[CONTRIBUTING.md](./CONTRIBUTING.md)** - Contribution guidelines and standards
- 💻 **[DevelopmentGuidelines.md](./DevelopmentGuidelines.md)** - Coding conventions and best practices

### For Product & Planning
- 📋 **[PRD.md](./PRD.md)** - Product Requirements Document with vision, goals, and features
- 🏢 **[MultiTenancyGuide.md](./MultiTenancyGuide.md)** - Multi-tenant architecture strategy (if exists)

---

## 📖 Documentation Overview

### 1. PROJECT_ARCHITECTURE_GUIDE.md
**Purpose**: Complete technical architecture reference

**What's Inside**:
- ✅ System overview with visual diagrams
- ✅ Technology stack breakdown (Next.js 16, NestJS 10, PostgreSQL, Nginx)
- ✅ Layer-by-layer architecture explanation
- ✅ Complete data flow analysis (request → database → response)
- ✅ Authentication & authorization deep dive
- ✅ Module structure patterns
- ✅ Step-by-step guide for adding new modules
- ✅ Practical example: Teacher Dashboard implementation
- ✅ Best practices & design patterns
- ✅ Development workflow

**Read this when**:
- You're new to the project and need to understand how everything works
- You need to understand the data flow from frontend to backend
- You want to see how authentication and multi-tenancy work
- You need to understand the module structure

### 2. VISUAL_DIAGRAMS.md
**Purpose**: Visual representations of system architecture

**What's Inside**:
- ✅ High-level system architecture diagram
- ✅ Authentication & authorization flow diagram
- ✅ Complete "Create Student" data flow example
- ✅ Module dependency graph
- ✅ Multi-tenancy data isolation visualization
- ✅ Frontend component hierarchy
- ✅ React Query cache structure
- ✅ Error handling flow

**Read this when**:
- You're a visual learner
- You need to explain the system to someone else
- You want to understand request/response flows
- You need to debug data flow issues

### 3. QUICK_START_CHECKLIST.md
**Purpose**: Practical step-by-step guide for adding features

**What's Inside**:
- ✅ Complete checklist for backend development
- ✅ Complete checklist for frontend development
- ✅ Code templates for entities, DTOs, services, controllers
- ✅ Code templates for React components, hooks, pages
- ✅ Time estimates for each phase
- ✅ Common pitfalls and how to avoid them
- ✅ Testing guidelines
- ✅ Post-development checklist

**Use this when**:
- You need to add a new feature (e.g., Teacher Portal, Attendance)
- You want a practical, copy-paste guide
- You need time estimates for planning
- You want to ensure you don't miss any steps

### 4. AGENTS.md
**Purpose**: AI agent guidelines and implementation reality check

**What's Inside**:
- ✅ Repository snapshot (current state)
- ✅ Backend architecture review
- ✅ Frontend architecture review
- ✅ DDD & Clean Architecture direction
- ✅ Actionable focus areas for improvements
- ✅ Workflow notes

**Read this when**:
- You're an AI agent contributing to the codebase
- You need to understand the gap between current state and ideal architecture
- You want to know what needs refactoring
- You need to understand the migration path to DDD

---

## 🚀 Getting Started Paths

### Path 1: New Developer Onboarding
1. Start with **[README.md](./README.md)** - Project overview
2. Read **[PROJECT_ARCHITECTURE_GUIDE.md](./PROJECT_ARCHITECTURE_GUIDE.md)** - Understand the system
3. Review **[VISUAL_DIAGRAMS.md](./VISUAL_DIAGRAMS.md)** - See how data flows
4. Follow setup instructions in README
5. Run the application locally
6. Review **[CONTRIBUTING.md](./CONTRIBUTING.md)** before making changes

### Path 2: Adding a New Feature
1. Read feature requirements from **[PRD.md](./PRD.md)**
2. Check **[AGENTS.md](./AGENTS.md)** for architectural guidelines
3. Use **[QUICK_START_CHECKLIST.md](./QUICK_START_CHECKLIST.md)** as your guide
4. Reference **[PROJECT_ARCHITECTURE_GUIDE.md](./PROJECT_ARCHITECTURE_GUIDE.md)** for patterns
5. Follow **[DevelopmentGuidelines.md](./DevelopmentGuidelines.md)** for code style
6. Test thoroughly before submitting PR

### Path 3: Understanding a Bug
1. Review **[VISUAL_DIAGRAMS.md](./VISUAL_DIAGRAMS.md)** to understand the flow
2. Check **[PROJECT_ARCHITECTURE_GUIDE.md](./PROJECT_ARCHITECTURE_GUIDE.md)** for the affected module
3. Review authentication flow if it's auth-related
4. Check multi-tenancy if it's data access related
5. Review error handling patterns

### Path 4: Reviewing Code
1. Check against **[DevelopmentGuidelines.md](./DevelopmentGuidelines.md)**
2. Verify multi-tenancy implementation
3. Check authentication/authorization guards
4. Verify DTO validation
5. Check React Query cache invalidation
6. Verify error handling

---

## 🎓 Key Concepts Explained

### Multi-Tenancy (schoolId)
Every entity in the database has a `schoolId` field. All queries must filter by `schoolId` to ensure schools can only access their own data.

**Where to learn more**:
- PROJECT_ARCHITECTURE_GUIDE.md → Authentication & Authorization section
- VISUAL_DIAGRAMS.md → Multi-Tenancy Data Isolation diagram

### Authentication Flow (Zitadel OIDC)
Users authenticate via Zitadel (external OIDC provider), receive a JWT token, and the backend validates this token on every request.

**Where to learn more**:
- PROJECT_ARCHITECTURE_GUIDE.md → Authentication & Authorization section
- VISUAL_DIAGRAMS.md → Authentication & Authorization Flow diagram

### Module Structure
Every feature follows a consistent pattern: Entity → DTO → Service → Controller → Module → Frontend (Types → API → Hooks → Components → Pages).

**Where to learn more**:
- PROJECT_ARCHITECTURE_GUIDE.md → Module Structure section
- QUICK_START_CHECKLIST.md → Complete implementation guide

### React Query Caching
Frontend uses React Query for server state management. Mutations invalidate cache to trigger automatic refetches.

**Where to learn more**:
- PROJECT_ARCHITECTURE_GUIDE.md → Best Practices section
- VISUAL_DIAGRAMS.md → React Query Cache Structure diagram

---

## 📊 Architecture Diagrams Quick Reference

### System Layers
```
Frontend (Next.js) → API Gateway → Auth/Security → Controllers → Services → Repository → Database
```

### Request Flow
```
User Action → React Component → React Query Hook → API Function → 
Axios Request → Backend Controller → Guards → Service → Repository → 
Database → Response → DTO Mapping → Frontend Update
```

### Multi-Tenancy
```
JWT Token → Extract schoolId → Filter all queries by schoolId → Return only tenant's data
```

---

## 🔧 Technology Stack Summary

### Frontend
- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript (Strict)
- **UI**: Material UI 7 + Tailwind CSS
- **State**: TanStack React Query
- **Forms**: React Hook Form + Yup
- **HTTP**: Axios

### Backend
- **Framework**: NestJS 10
- **Language**: TypeScript
- **Database**: PostgreSQL + TypeORM
- **Auth**: Zitadel OIDC + JWT
- **Validation**: class-validator
- **Docs**: Swagger/OpenAPI

### Infrastructure
- **Containers**: Docker + Docker Compose
- **Database**: PostgreSQL
- **Auth Provider**: Zitadel (self-hosted)
- **Reverse Proxy**: Nginx

---

## 🎯 Common Tasks & Where to Find Help

| Task | Document | Section |
|------|----------|---------|
| Add new module/feature | QUICK_START_CHECKLIST.md | Complete guide |
| Understand data flow | VISUAL_DIAGRAMS.md | Data Flow Analysis |
| Set up locally | README.md | Setup instructions |
| Fix auth issue | PROJECT_ARCHITECTURE_GUIDE.md | Authentication section |
| Add new entity | QUICK_START_CHECKLIST.md | Backend Phase 2 |
| Create new page | QUICK_START_CHECKLIST.md | Frontend Phase 5 |
| Understand caching | VISUAL_DIAGRAMS.md | React Query Cache |
| Review code | DevelopmentGuidelines.md | Coding standards |
| Understand DDD goals | AGENTS.md | DDD & Clean Architecture |
| Add new role | PROJECT_ARCHITECTURE_GUIDE.md | RBAC section |

---

## 💡 Best Practices Summary

### Backend
✅ Always filter by `schoolId` for multi-tenancy
✅ Use guards (`@UseGuards(AuthGuard, RolesGuard)`)
✅ Add role restrictions (`@Roles(UserRole.SCHOOL_ADMIN)`)
✅ Create DTOs for request/response validation
✅ Map entities to DTOs before returning
✅ Handle errors properly (NotFoundException, ConflictException)
✅ Document APIs with Swagger decorators

### Frontend
✅ Use React Query for server state
✅ Invalidate cache after mutations
✅ Handle loading and error states
✅ Use TypeScript types consistently
✅ Validate forms with Yup
✅ Keep components small and focused
✅ Use the `'use client'` directive for client components

### Security
✅ Never trust client input - validate on backend
✅ Always extract `schoolId` from JWT, never from request body
✅ Use UUID for IDs, never sequential integers
✅ Validate all DTOs with class-validator
✅ Use parameterized queries (TypeORM handles this)
✅ Don't expose internal errors to frontend

---

## 🐛 Debugging Guide

### Backend Issues
1. Check Swagger UI: `http://localhost:5000/api/docs`
2. Review NestJS logs in terminal
3. Check database with: `docker exec -it postgres psql -U postgres -d school_management`
4. Verify JWT token is valid
5. Check schoolId is being passed correctly

### Frontend Issues
1. Open browser DevTools → Network tab
2. Check API request/response
3. Review React Query DevTools
4. Check localStorage for token
5. Verify component is client-side (`'use client'`)

### Auth Issues
1. Check JWT token in localStorage
2. Verify token hasn't expired
3. Check Zitadel configuration
4. Review backend auth guards
5. Check user roles in JWT payload

### Multi-Tenancy Issues
1. Verify schoolId in JWT token
2. Check database queries include schoolId filter
3. Review service layer filtering logic
4. Test with users from different schools

---

## 📞 Need More Help?

### For AI Agents
- Read **AGENTS.md** for contribution guidelines
- Follow architectural patterns described in documents
- Always maintain multi-tenancy and security
- Respect the DDD migration path

### For Human Developers
- Review relevant documentation section
- Check existing similar modules for patterns
- Ask in team chat/discussion
- Create issue for clarification

---

## 📝 Keeping Documentation Updated

When you make changes:
1. ✅ Update README if setup process changes
2. ✅ Update API documentation in code (Swagger)
3. ✅ Update QUICK_START_CHECKLIST if process changes
4. ✅ Update diagrams if architecture changes
5. ✅ Document new environment variables
6. ✅ Update PRD if features change

---

## 🎉 Quick Wins

### Understand the System (1 hour)
1. Read PROJECT_ARCHITECTURE_GUIDE.md (30 min)
2. Review VISUAL_DIAGRAMS.md (20 min)
3. Run application locally (10 min)

### Add Your First Feature (3-4 hours)
1. Follow QUICK_START_CHECKLIST.md step by step
2. Use existing modules as templates
3. Test thoroughly
4. Submit PR

### Become Productive (1 week)
1. Complete first feature
2. Review all architectural documents
3. Understand multi-tenancy and auth flows
4. Contribute to 2-3 more features
5. Help review others' code

---

**Remember**: This is a living codebase. The documentation reflects both the current state and the target architecture. Always refer to AGENTS.md for the gap analysis and migration path toward DDD principles.

Happy coding! 🚀
