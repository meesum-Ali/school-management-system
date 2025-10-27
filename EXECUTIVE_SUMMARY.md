# 🎯 School Management System - Executive Summary

## Project Overview

Your **School Management System** is a modern, full-stack SaaS platform designed to digitize school operations. It's built with scalability, security, and multi-tenancy as core principles.

---

## 🏗️ Architecture at a Glance

```
┌────────────────────────────────────────────────────────────────┐
│                    CLIENT (Browser)                            │
│  ┌──────────────────────────────────────────────────────────┐ │
│  │         Next.js 16 Frontend (React + TypeScript)         │ │
│  │  • Server & Client Components                            │ │
│  │  • React Query (Caching & State)                         │ │
│  │  • Material UI + Tailwind (Styling)                      │ │
│  │  • React Hook Form (Form Management)                     │ │
│  └──────────────────────────────────────────────────────────┘ │
└───────────────────────────┬────────────────────────────────────┘
                            │ HTTPS / REST API
                            │ JWT Authentication
                            ▼
┌────────────────────────────────────────────────────────────────┐
│                    SERVER (Node.js)                            │
│  ┌──────────────────────────────────────────────────────────┐ │
│  │           NestJS 10 Backend (TypeScript)                 │ │
│  │  • Modular Architecture                                  │ │
│  │  • TypeORM (Database ORM)                                │ │
│  │  • Passport + Zitadel (Authentication)                   │ │
│  │  • Class Validator (Input Validation)                    │ │
│  │  • Swagger (API Documentation)                           │ │
│  └──────────────────────────────────────────────────────────┘ │
└───────────────────────────┬────────────────────────────────────┘
                            │ SQL Queries
                            ▼
┌────────────────────────────────────────────────────────────────┐
│                    DATABASE                                    │
│  ┌──────────────────────────────────────────────────────────┐ │
│  │              PostgreSQL (Relational DB)                  │ │
│  │  • Multi-tenant data (schoolId isolation)                │ │
│  │  • ACID compliance                                       │ │
│  │  • Migrations for schema management                      │ │
│  └──────────────────────────────────────────────────────────┘ │
└────────────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────────────┐
│              EXTERNAL SERVICES                                 │
│  ┌──────────────────────────────────────────────────────────┐ │
│  │        Zitadel (Identity & Access Management)            │ │
│  │  • OIDC Authentication                                   │ │
│  │  • User Management                                       │ │
│  │  • Role-Based Access Control                             │ │
│  └──────────────────────────────────────────────────────────┘ │
└────────────────────────────────────────────────────────────────┘
```

---

## 🎯 Core Features (Current Implementation)

### ✅ Implemented Modules
1. **Authentication & Authorization**
   - Zitadel OIDC integration
   - JWT token-based auth
   - Role-based access control (SUPER_ADMIN, SCHOOL_ADMIN, TEACHER, STUDENT)
   - Legacy local auth fallback

2. **User Management**
   - CRUD operations for users
   - Role assignment
   - School association

3. **Student Management**
   - Student profiles
   - Class enrollment
   - Academic records

4. **Teacher Management**
   - Teacher profiles
   - Subject specializations
   - Class assignments

5. **Class Management**
   - Class creation and management
   - Student enrollment
   - Homeroom teacher assignment

6. **Subject Management**
   - Subject definitions
   - Curriculum mapping

7. **Class Scheduling**
   - Timetable management
   - Period scheduling
   - Teacher-class-subject associations

8. **School Management**
   - School profiles (tenants)
   - School settings
   - Multi-tenant isolation

---

## 🔐 Security Model

### Multi-Tenancy (Data Isolation)
Every database table includes a `schoolId` column. All queries automatically filter by this field to ensure complete data isolation between schools.

```
School A Admin → JWT: { schoolId: "school-A" } → Can ONLY see School A data
School B Admin → JWT: { schoolId: "school-B" } → Can ONLY see School B data
```

### Role-Based Access Control (RBAC)

```
┌─────────────────┬───────────────────────────────────────────────┐
│ Role            │ Permissions                                   │
├─────────────────┼───────────────────────────────────────────────┤
│ SUPER_ADMIN     │ • Manage all schools                          │
│                 │ • View system-wide data                       │
│                 │ • Platform administration                     │
├─────────────────┼───────────────────────────────────────────────┤
│ SCHOOL_ADMIN    │ • Full CRUD on own school's data              │
│                 │ • Manage students, teachers, classes          │
│                 │ • View reports and analytics                  │
│                 │ • Manage school settings                      │
├─────────────────┼───────────────────────────────────────────────┤
│ TEACHER         │ • View assigned classes                       │
│                 │ • View students in classes                    │
│                 │ • Mark attendance (future)                    │
│                 │ • Enter grades (future)                       │
├─────────────────┼───────────────────────────────────────────────┤
│ STUDENT         │ • View own profile                            │
│                 │ • View own classes                            │
│                 │ • View own grades (future)                    │
│                 │ • View schedule (future)                      │
└─────────────────┴───────────────────────────────────────────────┘
```

---

## 📊 Data Model (Simplified)

```
┌─────────┐
│ Schools │ (Tenants)
└────┬────┘
     │ 1:N
     │
     ├──→ ┌────────┐
     │    │ Users  │
     │    └────────┘
     │
     ├──→ ┌──────────┐      ┌─────────┐
     │    │ Students │ N:1  │ Classes │
     │    └──────────┘ ─────└─────────┘
     │                          │
     │                          │ N:1 (homeroom)
     │                          ▼
     ├──→ ┌──────────┐      ┌─────────┐
     │    │ Teachers │      │         │
     │    └──────────┘      │         │
     │         │            │         │
     │         │ N:N via    │         │
     │         └───────────→│         │
     │                      │         │
     ├──→ ┌──────────┐      │         │
     │    │ Subjects │ N:N  │         │
     │    └──────────┘ ─────┘         │
     │         │                       │
     │         └───────────────────────┘
     │
     └──→ ┌───────────────┐
          │ ClassSchedule │ (Timetable)
          └───────────────┘
```

---

## 🔄 Request-Response Flow (Example: Get Students)

```
1. USER ACTION
   Admin clicks "Students" in sidebar
   ↓

2. FRONTEND
   - Page component renders
   - useStudents() hook triggers
   - React Query checks cache
   - If stale/empty, calls fetchStudents()
   ↓

3. API CALL
   GET /api/students
   Headers: Authorization: Bearer <JWT>
   ↓

4. BACKEND - GUARDS
   - AuthGuard: Validates JWT, extracts user info
   - RolesGuard: Checks user has SCHOOL_ADMIN role
   ↓

5. BACKEND - CONTROLLER
   - Extracts schoolId from req.user
   - Calls service.findAll(schoolId)
   ↓

6. BACKEND - SERVICE
   - Queries: repository.find({ where: { schoolId } })
   - Maps entities to DTOs
   ↓

7. DATABASE
   SELECT * FROM students WHERE school_id = 'xxx'
   Returns rows
   ↓

8. BACKEND - RESPONSE
   - Entities → DTOs
   - JSON serialization
   - HTTP 200 + JSON body
   ↓

9. FRONTEND - UPDATE
   - React Query caches response
   - Component re-renders
   - Table displays student list
   ↓

10. USER SEES
    ✓ List of students in table format
    ✓ Can create/edit/delete
```

---

## 📁 Project Structure

```
school-management-system/
├── backend/                    # NestJS API
│   ├── src/
│   │   ├── students/          # Student module
│   │   │   ├── entities/      # Database schema
│   │   │   ├── dto/           # Data transfer objects
│   │   │   ├── students.controller.ts
│   │   │   ├── students.service.ts
│   │   │   └── students.module.ts
│   │   ├── teachers/          # Similar structure
│   │   ├── classes/           # Similar structure
│   │   ├── auth/              # Authentication
│   │   ├── users/             # User management
│   │   ├── schools/           # Tenant management
│   │   └── main.ts            # Entry point
│   ├── test/                  # E2E tests
│   └── package.json
│
├── frontend/                   # Next.js App
│   ├── app/                   # App Router pages
│   │   ├── admin/             # Admin panel
│   │   │   ├── students/      # Student pages
│   │   │   ├── teachers/      # Teacher pages
│   │   │   ├── classes/       # Class pages
│   │   │   └── dashboard/     # Dashboard
│   │   ├── teacher/           # Teacher portal (future)
│   │   ├── student/           # Student portal (future)
│   │   └── auth/              # Auth pages
│   ├── components/            # React components
│   │   ├── Students/          # Student components
│   │   ├── Layout/            # Layout components
│   │   ├── ui/                # Reusable UI
│   │   └── providers/         # Context providers
│   ├── hooks/                 # React Query hooks
│   ├── lib/                   # Utilities
│   │   └── api.ts             # API functions
│   ├── types/                 # TypeScript types
│   └── package.json
│
├── docker-compose.yml         # Local dev environment
├── README.md                  # Setup instructions
├── PRD.md                     # Product requirements
├── AGENTS.md                  # AI agent guidelines
├── PROJECT_ARCHITECTURE_GUIDE.md    # This guide
├── VISUAL_DIAGRAMS.md         # Visual diagrams
├── QUICK_START_CHECKLIST.md  # Feature checklist
└── DOCUMENTATION_INDEX.md     # Doc navigation
```

---

## 🚀 Development Workflow

```
1. LOCAL SETUP
   ├─ Install dependencies (npm install)
   ├─ Start Docker Compose (db + Zitadel)
   ├─ Configure .env files
   └─ Start backend & frontend

2. ADD NEW FEATURE
   ├─ Design API endpoints
   ├─ Create backend module
   │  ├─ Entity (database schema)
   │  ├─ DTOs (validation)
   │  ├─ Service (business logic)
   │  ├─ Controller (routes)
   │  └─ Module (registration)
   ├─ Test API in Swagger
   ├─ Create frontend types
   ├─ Create API functions
   ├─ Create React Query hooks
   ├─ Create UI components
   ├─ Create pages
   └─ Test end-to-end

3. CODE QUALITY
   ├─ Run linter
   ├─ Write tests
   ├─ Document changes
   └─ Create pull request
```

---

## 💡 Key Design Patterns

### Backend Patterns

1. **Module-Based Architecture**
   - Each feature is a self-contained module
   - Clear separation of concerns
   - Easy to test and maintain

2. **DTO Pattern**
   - Input validation with class-validator
   - Output transformation (hide sensitive data)
   - Type safety across layers

3. **Repository Pattern**
   - TypeORM repositories for database access
   - Abstraction over SQL queries
   - Easy to mock for testing

4. **Guard Pattern**
   - Authentication guard (JWT validation)
   - Authorization guard (role checking)
   - Composable and reusable

### Frontend Patterns

1. **Server State Management (React Query)**
   - Automatic caching
   - Background refetching
   - Optimistic updates
   - Error handling

2. **Component Composition**
   - Small, focused components
   - Reusable UI components
   - Layout components for structure

3. **Form Handling**
   - React Hook Form for state
   - Yup for validation
   - Controlled inputs

4. **Route-Based Code Splitting**
   - Next.js App Router
   - Automatic code splitting
   - Lazy loading

---

## 📈 Current vs Target Architecture

### Current State (Resource-First)
```
Controller → Service → Repository → Database
     ↓          ↓          ↓
   Routes   Business    Database
             Logic      Queries
```

**Issues**:
- Business logic mixed with persistence
- Validation in both DTOs and entities
- No clear domain boundaries
- Hard to test in isolation

### Target State (Domain-Driven Design)
```
Controller → Use Case → Domain Model → Repository
     ↓          ↓            ↓              ↓
  Routes   Application   Business       Database
            Layer        Invariants      Access
```

**Benefits**:
- Clear separation of concerns
- Business logic in pure domain objects
- Easy to test (no database needed)
- Maintainable and scalable

**Migration Path**: See `AGENTS.md` for detailed refactoring plan

---

## 🎯 Next Steps for New Features

### To Add Teacher Portal:
1. Follow `QUICK_START_CHECKLIST.md`
2. Create backend endpoints for teacher dashboard
3. Create frontend pages under `/app/teacher/`
4. Implement role guard for `UserRole.TEACHER`
5. Add navigation in sidebar

### To Add Student Portal:
1. Follow `QUICK_START_CHECKLIST.md`
2. Create backend endpoints for student data
3. Create frontend pages under `/app/student/`
4. Implement role guard for `UserRole.STUDENT`
5. Add navigation in sidebar

### To Add Attendance Module:
1. Create Attendance entity with student/class relationships
2. Create CRUD endpoints
3. Add teacher permission to mark attendance
4. Create calendar-style UI component
5. Add reports for admin

**Estimated Time per Feature**: 3-4 hours (following checklist)

---

## 📚 Documentation Quick Links

- **Understanding**: [PROJECT_ARCHITECTURE_GUIDE.md](./PROJECT_ARCHITECTURE_GUIDE.md)
- **Visual Diagrams**: [VISUAL_DIAGRAMS.md](./VISUAL_DIAGRAMS.md)
- **Adding Features**: [QUICK_START_CHECKLIST.md](./QUICK_START_CHECKLIST.md)
- **AI Guidelines**: [AGENTS.md](./AGENTS.md)
- **All Docs**: [DOCUMENTATION_INDEX.md](./DOCUMENTATION_INDEX.md)

---

## 🎓 Key Takeaways

1. ✅ **Multi-tenant by design** - Every query filters by schoolId
2. ✅ **Security first** - JWT + RBAC on every endpoint
3. ✅ **Consistent patterns** - Same structure for all modules
4. ✅ **Type safety** - TypeScript end-to-end
5. ✅ **Modern stack** - Latest versions of Next.js, NestJS, React
6. ✅ **Documented** - Comprehensive guides for every aspect
7. ✅ **Scalable** - Ready to add more features easily

---

## 🤝 Contributing

1. Read `CONTRIBUTING.md` for guidelines
2. Follow `DevelopmentGuidelines.md` for code style
3. Use `QUICK_START_CHECKLIST.md` for new features
4. Test thoroughly before submitting PR
5. Document your changes

---

**Your system is well-architected, thoroughly documented, and ready for rapid feature development! 🚀**
