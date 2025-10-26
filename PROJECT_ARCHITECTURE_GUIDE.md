# School Management System - Complete Architecture Guide

## 📋 Table of Contents
1. [System Overview](#system-overview)
2. [Technology Stack](#technology-stack)
3. [Architecture Layers](#architecture-layers)
4. [Data Flow Analysis](#data-flow-analysis)
5. [Authentication & Authorization](#authentication--authorization)
6. [Module Structure](#module-structure)
7. [Step-by-Step Guide: Adding New Modules](#step-by-step-guide-adding-new-modules)
8. [Practical Example: Teacher Dashboard Module](#practical-example-teacher-dashboard-module)
9. [Best Practices & Patterns](#best-practices--patterns)

---

## 🏗️ System Overview

Your School Management System is a **full-stack SaaS application** with multi-tenant architecture:

```
┌─────────────────────────────────────────────────────────────────┐
│                         CLIENT BROWSER                          │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │           Next.js 14 Frontend (Port 3000/3001)            │  │
│  │  ┌─────────────┐  ┌──────────────┐  ┌─────────────────┐  │  │
│  │  │ React Pages │→ │ React Query  │→ │  Axios API Client│ │  │
│  │  │   (UI/UX)   │  │ (State Mgmt) │  │  (HTTP Calls)   │  │  │
│  │  └─────────────┘  └──────────────┘  └─────────────────┘  │  │
│  └───────────────────────────────────────────────────────────┘  │
└───────────────────────────────┬─────────────────────────────────┘
                                │ HTTP/HTTPS
                                │ JWT Token in Headers
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                    NestJS Backend API (Port 5000)               │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │                     API Gateway Layer                      │  │
│  │  ┌────────────┐  ┌──────────────┐  ┌─────────────────┐   │  │
│  │  │Controllers │→ │   Guards     │→ │   Decorators    │   │  │
│  │  │ (Routes)   │  │ (Auth/Roles) │  │  (@Roles, etc)  │   │  │
│  │  └────────────┘  └──────────────┘  └─────────────────┘   │  │
│  └───────────────────────────────────────────────────────────┘  │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │                     Service Layer                          │  │
│  │  ┌────────────┐  ┌──────────────┐  ┌─────────────────┐   │  │
│  │  │  Business  │→ │     DTOs     │→ │    Validation   │   │  │
│  │  │   Logic    │  │  (Data Obj)  │  │  (class-valid)  │   │  │
│  │  └────────────┘  └──────────────┘  └─────────────────┘   │  │
│  └───────────────────────────────────────────────────────────┘  │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │                  Persistence Layer                         │  │
│  │  ┌────────────┐  ┌──────────────┐  ┌─────────────────┐   │  │
│  │  │  TypeORM   │→ │   Entities   │→ │   Repositories  │   │  │
│  │  │ (ORM Core) │  │  (DB Schema) │  │   (DB Access)   │   │  │
│  │  └────────────┘  └──────────────┘  └─────────────────┘   │  │
│  └───────────────────────────────────────────────────────────┘  │
└───────────────────────────────┬─────────────────────────────────┘
                                │ SQL Queries
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                    PostgreSQL Database                          │
│  ┌────────┐  ┌────────┐  ┌────────┐  ┌────────┐  ┌────────┐   │
│  │Schools │  │ Users  │  │Students│  │Teachers│  │Classes │   │
│  └────────┘  └────────┘  └────────┘  └────────┘  └────────┘   │
│  ┌────────┐  ┌────────┐  ┌────────┐                            │
│  │Subjects│  │Schedule│  │ Etc... │                            │
│  └────────┘  └────────┘  └────────┘                            │
└─────────────────────────────────────────────────────────────────┘
         ▲
         │
┌────────┴────────┐
│   Zitadel OIDC  │  (External Auth Provider)
│  Auth Service   │
└─────────────────┘
```

---

## 🛠️ Technology Stack

### **Frontend (Next.js 14)**
```yaml
Framework: Next.js 14 (App Router)
Language: TypeScript (Strict Mode)
UI Library: 
  - React 18
  - Material UI 7
  - Tailwind CSS
State Management: TanStack React Query (formerly React Query)
HTTP Client: Axios
Form Handling: React Hook Form + Yup validation
Authentication: Custom AuthProvider (Context API)
```

### **Backend (NestJS 10)**
```yaml
Framework: NestJS 10
Language: TypeScript
ORM: TypeORM
Database: PostgreSQL
Authentication:
  - Zitadel OIDC (JWT + JWKS)
  - Legacy local auth (bcrypt + JWT)
API Documentation: Swagger/OpenAPI
Validation: class-validator + class-transformer
Guards: AuthGuard, RolesGuard
Multi-tenancy: Request-scoped schoolId injection
```

### **Infrastructure**
```yaml
Containerization: Docker + Docker Compose
Database: PostgreSQL
Auth Provider: Zitadel (self-hosted)
Web Server: Nginx (reverse proxy)
```

---

## 🏛️ Architecture Layers

### **Frontend Architecture**

```
frontend/
├── app/                          # Next.js 14 App Router
│   ├── layout.tsx               # Root layout with providers
│   ├── page.tsx                 # Landing page
│   ├── admin/                   # Admin panel routes
│   │   ├── layout.tsx          # Admin layout wrapper
│   │   ├── dashboard/          # Dashboard page
│   │   ├── students/           # Student management
│   │   │   ├── page.tsx        # List students
│   │   │   ├── create/         # Create student
│   │   │   └── [id]/           # Edit student (dynamic route)
│   │   ├── teachers/           # Similar structure
│   │   ├── classes/            # Similar structure
│   │   └── ...
│   └── auth/                    # Auth routes (login, etc)
│
├── components/                  # React components
│   ├── Layout/                 # Layout components
│   │   ├── AdminLayout.tsx    # Admin panel layout
│   │   ├── Navbar.tsx         # Navigation bar
│   │   ├── Sidebar.tsx        # Sidebar menu
│   │   └── Notification.tsx   # Toast/alert component
│   ├── Students/               # Student-specific components
│   │   ├── StudentList.tsx    # Table/list view
│   │   └── StudentForm.tsx    # Create/edit form
│   ├── Teachers/               # Teacher components
│   ├── ui/                     # Reusable UI components
│   │   ├── Button.tsx
│   │   ├── Card.tsx
│   │   ├── Input.tsx
│   │   └── ...
│   └── providers/              # Context providers
│       ├── auth-provider.tsx  # Auth context
│       ├── theme-provider.tsx # MUI theme
│       └── react-query-provider.tsx
│
├── hooks/                       # Custom React hooks
│   ├── useStudents.ts          # Student CRUD + cache management
│   ├── useTeachers.ts          # Teacher CRUD + cache management
│   ├── useClasses.ts           # Class CRUD + cache management
│   └── ...
│
├── lib/                         # Utility libraries
│   ├── api.ts                  # Axios instance + API functions
│   ├── browser.ts              # Browser-only utilities
│   ├── config.ts               # App configuration
│   └── auth/                   # Auth utilities
│
├── types/                       # TypeScript definitions
│   ├── student.ts              # Student interfaces/types
│   ├── teacher.ts              # Teacher interfaces/types
│   ├── class.ts                # Class interfaces/types
│   ├── user.ts                 # User interfaces/types
│   └── ...
│
└── styles/                      # Global styles
    ├── globals.css
    └── components.css
```

### **Backend Architecture**

```
backend/src/
├── main.ts                      # Application entry point
│   └── Bootstrap NestJS app, configure CORS, Swagger, Validation
│
├── app.module.ts               # Root module
│   └── Imports all feature modules, configures TypeORM, Config
│
├── configuration.ts            # Environment config loader
├── configuration.interface.ts  # Config type definitions
│
├── auth/                       # Authentication module
│   ├── auth.module.ts
│   ├── auth.controller.ts     # Login endpoints
│   ├── auth.service.ts        # Auth business logic
│   ├── guards/
│   │   └── roles.guard.ts     # RBAC guard
│   └── decorators/
│       ├── roles.decorator.ts # @Roles() decorator
│       └── public.decorator.ts# @Public() decorator
│
├── zitadel/                    # Zitadel OIDC integration
│   ├── zitadel.module.ts
│   └── zitadel.strategy.ts    # Passport JWT strategy
│
├── users/                      # User management module
│   ├── users.module.ts
│   ├── users.controller.ts
│   ├── users.service.ts
│   ├── entities/
│   │   └── user.entity.ts     # User database schema
│   └── dto/
│       ├── create-user.dto.ts
│       ├── update-user.dto.ts
│       └── user.dto.ts
│
├── students/                   # Student management module
│   ├── students.module.ts
│   ├── students.controller.ts # REST endpoints
│   ├── students.service.ts    # Business logic
│   ├── entities/
│   │   └── student.entity.ts  # TypeORM entity
│   └── dto/
│       ├── create-student.dto.ts  # Validation schema
│       ├── update-student.dto.ts
│       ├── student.dto.ts         # Response schema
│       └── assign-class.dto.ts
│
├── teachers/                   # Teacher management module
│   └── [Similar structure to students]
│
├── classes/                    # Class management module
│   └── [Similar structure to students]
│
├── subjects/                   # Subject management module
│   └── [Similar structure to students]
│
├── schools/                    # School (tenant) management
│   └── [Similar structure to students]
│
├── class-schedule/            # Scheduling module
│   └── [Similar structure to students]
│
├── core/                      # Core/shared modules
│   ├── super-admin/          # Super admin features
│   └── database/             # Database utilities
│
├── health/                    # Health check endpoints
│   └── health.controller.ts
│
└── migrations/                # TypeORM migrations
    └── *.ts
```

---

## 🔄 Data Flow Analysis

### **Complete Request-Response Flow**

Let's trace a **"Get All Students"** request from browser to database and back:

```
┌─────────────────────────────────────────────────────────────────┐
│ STEP 1: User Action (Frontend)                                  │
└─────────────────────────────────────────────────────────────────┘

User clicks "Students" in sidebar
    ↓
Navigation to /admin/students/page.tsx
    ↓
Component renders and calls useStudents() hook
    ↓
React Query triggers fetchStudents() from lib/api.ts


┌─────────────────────────────────────────────────────────────────┐
│ STEP 2: API Request (Frontend)                                  │
└─────────────────────────────────────────────────────────────────┘

// hooks/useStudents.ts
export function useStudents() {
  return useQuery({
    queryKey: studentKeys.all,      // Cache key: ['students']
    queryFn: fetchStudents,          // API call function
  })
}
    ↓
// lib/api.ts
export const fetchStudents = async (): Promise<Student[]> => {
  const response = await api.get<Student[]>('/students')
  return response.data
}
    ↓
Axios Interceptor adds Authorization header:
  Headers: {
    'Authorization': 'Bearer <JWT_TOKEN>',
    'Content-Type': 'application/json'
  }
    ↓
HTTP GET Request: http://localhost:5000/api/students


┌─────────────────────────────────────────────────────────────────┐
│ STEP 3: Backend Request Processing                              │
└─────────────────────────────────────────────────────────────────┘

Request arrives at NestJS backend
    ↓
Global Middleware runs:
  - CORS validation
  - Request logging
    ↓
Route matching: GET /api/students
    ↓
Controller method identified:
  StudentsController.findAll()
    ↓
Guards execute (in order):
  1. @UseGuards(AuthGuard('zitadel'))
     ├─→ Validates JWT token
     ├─→ Decodes user info (id, email, roles, schoolId)
     └─→ Attaches to req.user
  
  2. @UseGuards(RolesGuard)
     ├─→ Checks @Roles(UserRole.SCHOOL_ADMIN)
     └─→ Verifies req.user.roles includes SCHOOL_ADMIN
    ↓
If guards pass, controller method executes:

// students.controller.ts
@Get()
@Roles(UserRole.SCHOOL_ADMIN)
async findAll(@Req() req: any): Promise<StudentDto[]> {
  const schoolId = this.getSchoolIdFromRequest(req);
  return this.studentsService.findAll(schoolId);
}


┌─────────────────────────────────────────────────────────────────┐
│ STEP 4: Service Layer Processing                                │
└─────────────────────────────────────────────────────────────────┘

Controller calls service method:
    ↓
// students.service.ts
async findAll(schoolId: string): Promise<StudentDto[]> {
  // Query database with multi-tenant filter
  const students = await this.studentsRepository.find({
    where: { schoolId },
    relations: ['currentClass'], // Eager load class info
    order: { createdAt: 'DESC' }
  });
  
  // Map entities to DTOs
  return Promise.all(
    students.map(student => this.mapStudentToStudentDto(student))
  );
}


┌─────────────────────────────────────────────────────────────────┐
│ STEP 5: Database Query                                          │
└─────────────────────────────────────────────────────────────────┘

TypeORM Repository executes SQL:

SELECT 
  s.id, s.firstName, s.lastName, s.dateOfBirth, 
  s.email, s.studentId, s.classId, s.schoolId,
  s.createdAt, s.updatedAt,
  c.id as class_id, c.name as class_name
FROM students s
LEFT JOIN classes c ON s.classId = c.id
WHERE s.schoolId = 'uuid-of-school'
ORDER BY s.createdAt DESC;
    ↓
PostgreSQL executes query and returns rows
    ↓
TypeORM maps rows to Student entities


┌─────────────────────────────────────────────────────────────────┐
│ STEP 6: Response Transformation                                 │
└─────────────────────────────────────────────────────────────────┘

Service maps entities to DTOs:

private async mapStudentToStudentDto(student: Student): Promise<StudentDto> {
  let currentClassName = null;
  if (student.currentClass) {
    const currentClass = await student.currentClass;
    currentClassName = currentClass?.name || null;
  }
  
  return {
    id: student.id,
    firstName: student.firstName,
    lastName: student.lastName,
    dateOfBirth: student.dateOfBirth,
    email: student.email,
    studentId: student.studentId,
    classId: student.classId,
    currentClassName: currentClassName,
    schoolId: student.schoolId,
    createdAt: student.createdAt,
    updatedAt: student.updatedAt
  };
}
    ↓
Array of StudentDto objects returned to controller
    ↓
Controller returns DTOs to client
    ↓
NestJS serializes to JSON


┌─────────────────────────────────────────────────────────────────┐
│ STEP 7: Frontend Receives Response                              │
└─────────────────────────────────────────────────────────────────┘

Axios receives HTTP 200 OK with JSON body:
[
  {
    "id": "uuid-1",
    "firstName": "John",
    "lastName": "Doe",
    "email": "john@example.com",
    "studentId": "S001",
    "dateOfBirth": "2005-01-15",
    "classId": "class-uuid",
    "currentClassName": "Grade 10A",
    "schoolId": "school-uuid",
    "createdAt": "2024-01-01T00:00:00Z",
    "updatedAt": "2024-01-01T00:00:00Z"
  },
  // ... more students
]
    ↓
React Query:
  - Caches response with key ['students']
  - Updates component state
  - Sets isLoading = false
    ↓
Component re-renders with student data
    ↓
StudentList.tsx displays table with student rows
```

---

## 🔐 Authentication & Authorization

### **Multi-Layer Security**

```
┌─────────────────────────────────────────────────────────────────┐
│                     Authentication Flow                         │
└─────────────────────────────────────────────────────────────────┘

1. User Login (Zitadel OIDC)
   ↓
   User enters credentials on frontend
   ↓
   Frontend redirects to Zitadel login page
   ↓
   Zitadel validates credentials
   ↓
   Zitadel redirects back with authorization code
   ↓
   Backend exchanges code for JWT access token
   ↓
   Backend validates JWT signature using JWKS
   ↓
   Backend decodes JWT payload:
   {
     "sub": "user-id",
     "email": "admin@school.com",
     "urn:zitadel:iam:org:project:roles": {
       "SCHOOL_ADMIN": { "org-id": "school-uuid" }
     },
     "urn:zitadel:iam:org:id": "school-uuid",
     "exp": 1234567890
   }
   ↓
   Backend creates session object:
   req.user = {
     id: "user-id",
     email: "admin@school.com",
     roles: [UserRole.SCHOOL_ADMIN],
     schoolId: "school-uuid"
   }
   ↓
   Frontend stores JWT in localStorage + cookie
   ↓
   Frontend initializes AuthProvider with user data


2. Subsequent Requests
   ↓
   Every API call includes: Authorization: Bearer <JWT>
   ↓
   Backend validates token on each request
   ↓
   Guards check roles and permissions


3. Multi-Tenancy Enforcement
   ↓
   schoolId extracted from JWT
   ↓
   All database queries filtered by schoolId
   ↓
   Users can only access their school's data
```

### **Role-Based Access Control (RBAC)**

```typescript
// Current Role Hierarchy
enum UserRole {
  SUPER_ADMIN = 'SUPER_ADMIN',  // Platform administrator
  SCHOOL_ADMIN = 'SCHOOL_ADMIN', // School administrator
  TEACHER = 'TEACHER',            // Teacher
  STUDENT = 'STUDENT'             // Student
}

// Access Matrix
┌──────────────────┬─────────────┬──────────────┬─────────┬─────────┐
│ Resource         │ SUPER_ADMIN │ SCHOOL_ADMIN │ TEACHER │ STUDENT │
├──────────────────┼─────────────┼──────────────┼─────────┼─────────┤
│ Schools          │     CRUD    │      R       │    -    │    -    │
│ Users (all)      │     CRUD    │     CRUD     │    R    │    -    │
│ Students         │      R      │     CRUD     │    R    │   R*    │
│ Teachers         │      R      │     CRUD     │    R    │   R*    │
│ Classes          │      R      │     CRUD     │   R/U   │   R*    │
│ Subjects         │      R      │     CRUD     │   R/U   │   R*    │
│ Schedules        │      R      │     CRUD     │    R    │   R*    │
│ Grades           │      -      │     CRUD     │   C/R/U │   R*    │
│ Attendance       │      -      │     CRUD     │   C/R/U │   R*    │
└──────────────────┴─────────────┴──────────────┴─────────┴─────────┘
* Own data only
```

---

## 📦 Module Structure

### **Anatomy of a Module**

Every module follows this consistent structure:

```
module-name/
├── module-name.module.ts       # NestJS module definition
├── module-name.controller.ts   # HTTP endpoints (routes)
├── module-name.service.ts      # Business logic
├── module-name.service.spec.ts # Unit tests
├── entities/
│   └── module-name.entity.ts   # Database schema (TypeORM)
└── dto/
    ├── create-module-name.dto.ts  # Input validation for CREATE
    ├── update-module-name.dto.ts  # Input validation for UPDATE
    └── module-name.dto.ts         # Output/response schema
```

### **Module Registration Flow**

```typescript
// 1. Create Module
@Module({
  imports: [
    TypeOrmModule.forFeature([Student, ClassEntity]), // Register entities
  ],
  controllers: [StudentsController],  // Register controllers
  providers: [StudentsService],       // Register services
  exports: [StudentsService],         // Export for use in other modules
})
export class StudentsModule {}

// 2. Register in App Module
@Module({
  imports: [
    ConfigModule.forRoot(...),
    TypeOrmModule.forRootAsync(...),
    StudentsModule,        // Import feature module
    TeachersModule,
    // ... other modules
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
```

---

## 🚀 Step-by-Step Guide: Adding New Modules

### **Scenario: Adding a "Teacher Dashboard" Module**

This guide will show you how to add a complete teacher dashboard where teachers can:
- View their assigned classes
- See their schedule
- View students in their classes
- Update attendance

---

## 📝 Practical Example: Teacher Dashboard Module

### **Phase 1: Backend Setup**

#### **Step 1: Create Module Structure**

```bash
# Navigate to backend
cd backend

# Generate module using NestJS CLI
nest g module teacher-dashboard
nest g controller teacher-dashboard
nest g service teacher-dashboard
```

This creates:
```
backend/src/teacher-dashboard/
├── teacher-dashboard.module.ts
├── teacher-dashboard.controller.ts
├── teacher-dashboard.controller.spec.ts
├── teacher-dashboard.service.ts
└── teacher-dashboard.service.spec.ts
```

#### **Step 2: Create DTOs**

Create `dto/teacher-dashboard.dto.ts`:

```typescript
import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

// Response DTO for teacher's overview
export class TeacherDashboardDto {
  @ApiProperty({ description: 'Teacher basic info' })
  teacher: {
    id: string;
    employeeId: string;
    userId: string;
    schoolId: string;
  };

  @ApiProperty({ description: 'Classes assigned to teacher' })
  assignedClasses: {
    id: string;
    name: string;
    grade: string;
    studentCount: number;
  }[];

  @ApiProperty({ description: 'Today\'s schedule' })
  todaySchedule: {
    id: string;
    subject: string;
    className: string;
    startTime: string;
    endTime: string;
    dayOfWeek: number;
  }[];

  @ApiProperty({ description: 'Pending tasks' })
  pendingTasks: {
    attendanceToMark: number;
    gradesToSubmit: number;
  };
}

// DTO for getting class students
export class ClassStudentsQueryDto {
  @ApiProperty({ description: 'Class ID' })
  @IsNotEmpty()
  classId: string;
}
```

#### **Step 3: Implement Service Logic**

Update `teacher-dashboard.service.ts`:

```typescript
import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Teacher } from '../teachers/entities/teacher.entity';
import { ClassEntity } from '../classes/entities/class.entity';
import { ClassSchedule } from '../class-schedule/entities/class-schedule.entity';
import { Student } from '../students/entities/student.entity';
import { TeacherDashboardDto } from './dto/teacher-dashboard.dto';

@Injectable()
export class TeacherDashboardService {
  constructor(
    @InjectRepository(Teacher)
    private teacherRepository: Repository<Teacher>,
    
    @InjectRepository(ClassEntity)
    private classRepository: Repository<ClassEntity>,
    
    @InjectRepository(ClassSchedule)
    private scheduleRepository: Repository<ClassSchedule>,
    
    @InjectRepository(Student)
    private studentRepository: Repository<Student>,
  ) {}

  async getDashboard(userId: string, schoolId: string): Promise<TeacherDashboardDto> {
    // Find teacher by userId
    const teacher = await this.teacherRepository.findOne({
      where: { userId, schoolId },
      relations: ['homeroomClasses', 'classSchedules'],
    });

    if (!teacher) {
      throw new NotFoundException('Teacher profile not found');
    }

    // Get assigned classes (homeroom classes)
    const homeroomClasses = await teacher.homeroomClasses;
    const classesWithCounts = await Promise.all(
      homeroomClasses.map(async (cls) => {
        const studentCount = await this.studentRepository.count({
          where: { classId: cls.id, schoolId },
        });
        return {
          id: cls.id,
          name: cls.name,
          grade: cls.grade,
          studentCount,
        };
      })
    );

    // Get today's schedule
    const today = new Date().getDay(); // 0 = Sunday, 1 = Monday, etc.
    const schedules = await teacher.classSchedules;
    const todaySchedule = await Promise.all(
      schedules
        .filter(schedule => schedule.dayOfWeek === today)
        .map(async (schedule) => {
          const subject = await schedule.subject;
          const classEntity = await schedule.class;
          return {
            id: schedule.id,
            subject: subject?.name || 'Unknown',
            className: classEntity?.name || 'Unknown',
            startTime: schedule.startTime,
            endTime: schedule.endTime,
            dayOfWeek: schedule.dayOfWeek,
          };
        })
    );

    // Calculate pending tasks (placeholder logic)
    const pendingTasks = {
      attendanceToMark: 0,  // TODO: Implement attendance logic
      gradesToSubmit: 0,    // TODO: Implement grades logic
    };

    return {
      teacher: {
        id: teacher.id,
        employeeId: teacher.employeeId,
        userId: teacher.userId,
        schoolId: teacher.schoolId,
      },
      assignedClasses: classesWithCounts,
      todaySchedule,
      pendingTasks,
    };
  }

  async getClassStudents(
    userId: string, 
    schoolId: string, 
    classId: string
  ): Promise<Student[]> {
    // Verify teacher has access to this class
    const teacher = await this.teacherRepository.findOne({
      where: { userId, schoolId },
      relations: ['homeroomClasses', 'classSchedules'],
    });

    if (!teacher) {
      throw new NotFoundException('Teacher profile not found');
    }

    // Check if teacher is homeroom teacher or teaches this class
    const homeroomClasses = await teacher.homeroomClasses;
    const schedules = await teacher.classSchedules;
    
    const hasAccess = 
      homeroomClasses.some(cls => cls.id === classId) ||
      schedules.some(schedule => schedule.classId === classId);

    if (!hasAccess) {
      throw new ForbiddenException('You do not have access to this class');
    }

    // Get students
    return this.studentRepository.find({
      where: { classId, schoolId },
      order: { lastName: 'ASC', firstName: 'ASC' },
    });
  }
}
```

#### **Step 4: Implement Controller**

Update `teacher-dashboard.controller.ts`:

```typescript
import {
  Controller,
  Get,
  Query,
  UseGuards,
  Req,
  HttpStatus,
} from '@nestjs/common';
import { 
  ApiTags, 
  ApiBearerAuth, 
  ApiOperation, 
  ApiResponse 
} from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/entities/user.entity';
import { TeacherDashboardService } from './teacher-dashboard.service';
import { 
  TeacherDashboardDto, 
  ClassStudentsQueryDto 
} from './dto/teacher-dashboard.dto';

@ApiTags('Teacher Dashboard')
@ApiBearerAuth()
@Controller('teacher-dashboard')
@UseGuards(AuthGuard('zitadel'), RolesGuard)
@Roles(UserRole.TEACHER)
export class TeacherDashboardController {
  constructor(
    private readonly teacherDashboardService: TeacherDashboardService
  ) {}

  @Get()
  @ApiOperation({ summary: 'Get teacher dashboard overview' })
  @ApiResponse({ 
    status: HttpStatus.OK, 
    description: 'Dashboard data retrieved successfully.',
    type: TeacherDashboardDto 
  })
  @ApiResponse({ 
    status: HttpStatus.NOT_FOUND, 
    description: 'Teacher profile not found.' 
  })
  async getDashboard(@Req() req: any): Promise<TeacherDashboardDto> {
    const userId = req.user.id;
    const schoolId = req.user.schoolId;
    return this.teacherDashboardService.getDashboard(userId, schoolId);
  }

  @Get('class-students')
  @ApiOperation({ summary: 'Get students in a specific class' })
  @ApiResponse({ 
    status: HttpStatus.OK, 
    description: 'Students retrieved successfully.' 
  })
  @ApiResponse({ 
    status: HttpStatus.FORBIDDEN, 
    description: 'You do not have access to this class.' 
  })
  async getClassStudents(
    @Query() query: ClassStudentsQueryDto,
    @Req() req: any
  ) {
    const userId = req.user.id;
    const schoolId = req.user.schoolId;
    return this.teacherDashboardService.getClassStudents(
      userId, 
      schoolId, 
      query.classId
    );
  }
}
```

#### **Step 5: Register Module**

Update `teacher-dashboard.module.ts`:

```typescript
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TeacherDashboardController } from './teacher-dashboard.controller';
import { TeacherDashboardService } from './teacher-dashboard.service';
import { Teacher } from '../teachers/entities/teacher.entity';
import { ClassEntity } from '../classes/entities/class.entity';
import { ClassSchedule } from '../class-schedule/entities/class-schedule.entity';
import { Student } from '../students/entities/student.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Teacher,
      ClassEntity,
      ClassSchedule,
      Student,
    ]),
  ],
  controllers: [TeacherDashboardController],
  providers: [TeacherDashboardService],
  exports: [TeacherDashboardService],
})
export class TeacherDashboardModule {}
```

Add to `app.module.ts`:

```typescript
import { TeacherDashboardModule } from './teacher-dashboard/teacher-dashboard.module';

@Module({
  imports: [
    // ... existing modules
    TeacherDashboardModule,  // Add this
  ],
  // ...
})
export class AppModule {}
```

---

### **Phase 2: Frontend Setup**

#### **Step 6: Create Type Definitions**

Create `frontend/types/teacher-dashboard.ts`:

```typescript
export interface TeacherDashboard {
  teacher: {
    id: string;
    employeeId: string;
    userId: string;
    schoolId: string;
  };
  assignedClasses: {
    id: string;
    name: string;
    grade: string;
    studentCount: number;
  }[];
  todaySchedule: {
    id: string;
    subject: string;
    className: string;
    startTime: string;
    endTime: string;
    dayOfWeek: number;
  }[];
  pendingTasks: {
    attendanceToMark: number;
    gradesToSubmit: number;
  };
}

export interface ClassStudent {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  studentId: string;
  dateOfBirth: string;
}
```

#### **Step 7: Create API Functions**

Add to `frontend/lib/api.ts`:

```typescript
import { TeacherDashboard, ClassStudent } from '../types/teacher-dashboard';

const TEACHER_DASHBOARD_PATH = '/teacher-dashboard';

export const fetchTeacherDashboard = async (): Promise<TeacherDashboard> => {
  const response = await api.get<TeacherDashboard>(TEACHER_DASHBOARD_PATH);
  return response.data;
};

export const fetchClassStudents = async (
  classId: string
): Promise<ClassStudent[]> => {
  const response = await api.get<ClassStudent[]>(
    `${TEACHER_DASHBOARD_PATH}/class-students`,
    { params: { classId } }
  );
  return response.data;
};
```

#### **Step 8: Create React Query Hooks**

Create `frontend/hooks/useTeacherDashboard.ts`:

```typescript
import { useQuery } from '@tanstack/react-query';
import { fetchTeacherDashboard, fetchClassStudents } from '@/lib/api';

export const teacherDashboardKeys = {
  dashboard: ['teacher-dashboard'] as const,
  classStudents: (classId: string) => 
    ['teacher-dashboard', 'class-students', classId] as const,
};

export function useTeacherDashboard() {
  return useQuery({
    queryKey: teacherDashboardKeys.dashboard,
    queryFn: fetchTeacherDashboard,
    staleTime: 5 * 60 * 1000, // Consider data fresh for 5 minutes
  });
}

export function useClassStudents(classId: string) {
  return useQuery({
    queryKey: teacherDashboardKeys.classStudents(classId),
    queryFn: () => fetchClassStudents(classId),
    enabled: !!classId, // Only fetch when classId is provided
  });
}
```

#### **Step 9: Create UI Components**

Create `frontend/components/Teachers/DashboardSummary.tsx`:

```typescript
'use client';

import React from 'react';
import { Card } from '../ui/Card';
import { TeacherDashboard } from '@/types/teacher-dashboard';

interface DashboardSummaryProps {
  dashboard: TeacherDashboard;
}

export const DashboardSummary: React.FC<DashboardSummaryProps> = ({ 
  dashboard 
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      {/* Assigned Classes Card */}
      <Card>
        <div className="p-4">
          <h3 className="text-lg font-semibold text-gray-700 mb-2">
            Assigned Classes
          </h3>
          <p className="text-3xl font-bold text-blue-600">
            {dashboard.assignedClasses.length}
          </p>
          <p className="text-sm text-gray-500 mt-1">
            Total students: {
              dashboard.assignedClasses.reduce(
                (sum, cls) => sum + cls.studentCount, 0
              )
            }
          </p>
        </div>
      </Card>

      {/* Today's Schedule Card */}
      <Card>
        <div className="p-4">
          <h3 className="text-lg font-semibold text-gray-700 mb-2">
            Today's Classes
          </h3>
          <p className="text-3xl font-bold text-green-600">
            {dashboard.todaySchedule.length}
          </p>
          <p className="text-sm text-gray-500 mt-1">
            Scheduled periods
          </p>
        </div>
      </Card>

      {/* Pending Tasks Card */}
      <Card>
        <div className="p-4">
          <h3 className="text-lg font-semibold text-gray-700 mb-2">
            Pending Tasks
          </h3>
          <p className="text-3xl font-bold text-orange-600">
            {dashboard.pendingTasks.attendanceToMark + 
             dashboard.pendingTasks.gradesToSubmit}
          </p>
          <p className="text-sm text-gray-500 mt-1">
            Tasks to complete
          </p>
        </div>
      </Card>
    </div>
  );
};
```

Create `frontend/components/Teachers/ClassList.tsx`:

```typescript
'use client';

import React from 'react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { TeacherDashboard } from '@/types/teacher-dashboard';

interface ClassListProps {
  classes: TeacherDashboard['assignedClasses'];
  onClassClick: (classId: string) => void;
}

export const ClassList: React.FC<ClassListProps> = ({ 
  classes, 
  onClassClick 
}) => {
  return (
    <Card>
      <div className="p-4">
        <h2 className="text-xl font-semibold mb-4">My Classes</h2>
        <div className="space-y-3">
          {classes.map((cls) => (
            <div
              key={cls.id}
              className="flex justify-between items-center p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <div>
                <h3 className="font-medium text-gray-900">{cls.name}</h3>
                <p className="text-sm text-gray-600">
                  Grade {cls.grade} • {cls.studentCount} students
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onClassClick(cls.id)}
              >
                View Students
              </Button>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
};
```

Create `frontend/components/Teachers/TodaySchedule.tsx`:

```typescript
'use client';

import React from 'react';
import { Card } from '../ui/Card';
import { TeacherDashboard } from '@/types/teacher-dashboard';

interface TodayScheduleProps {
  schedule: TeacherDashboard['todaySchedule'];
}

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export const TodaySchedule: React.FC<TodayScheduleProps> = ({ schedule }) => {
  const today = DAYS[new Date().getDay()];

  return (
    <Card>
      <div className="p-4">
        <h2 className="text-xl font-semibold mb-4">
          Today's Schedule - {today}
        </h2>
        {schedule.length === 0 ? (
          <p className="text-gray-500 text-center py-8">
            No classes scheduled for today
          </p>
        ) : (
          <div className="space-y-3">
            {schedule
              .sort((a, b) => a.startTime.localeCompare(b.startTime))
              .map((item) => (
                <div
                  key={item.id}
                  className="flex items-center p-3 bg-blue-50 rounded-lg"
                >
                  <div className="flex-shrink-0 w-20 text-center">
                    <p className="text-sm font-medium text-blue-900">
                      {item.startTime}
                    </p>
                    <p className="text-xs text-blue-700">{item.endTime}</p>
                  </div>
                  <div className="ml-4 flex-1">
                    <h4 className="font-medium text-gray-900">
                      {item.subject}
                    </h4>
                    <p className="text-sm text-gray-600">{item.className}</p>
                  </div>
                </div>
              ))}
          </div>
        )}
      </div>
    </Card>
  );
};
```

#### **Step 10: Create Dashboard Page**

Create `frontend/app/teacher/dashboard/page.tsx`:

```typescript
'use client';

import React, { useState } from 'react';
import { useTeacherDashboard, useClassStudents } from '@/hooks/useTeacherDashboard';
import { DashboardSummary } from '@/components/Teachers/DashboardSummary';
import { ClassList } from '@/components/Teachers/ClassList';
import { TodaySchedule } from '@/components/Teachers/TodaySchedule';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

export default function TeacherDashboardPage() {
  const [selectedClassId, setSelectedClassId] = useState<string | null>(null);
  
  const { 
    data: dashboard, 
    isLoading, 
    error 
  } = useTeacherDashboard();
  
  const { 
    data: students, 
    isLoading: studentsLoading 
  } = useClassStudents(selectedClassId || '');

  if (isLoading) {
    return (
      <div className="container mx-auto p-4">
        <p>Loading dashboard...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-4">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          Error loading dashboard: {error.message}
        </div>
      </div>
    );
  }

  if (!dashboard) {
    return (
      <div className="container mx-auto p-4">
        <p>No dashboard data available</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">Teacher Dashboard</h1>
      
      {/* Summary Cards */}
      <DashboardSummary dashboard={dashboard} />

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Classes */}
        <ClassList
          classes={dashboard.assignedClasses}
          onClassClick={setSelectedClassId}
        />

        {/* Today's Schedule */}
        <TodaySchedule schedule={dashboard.todaySchedule} />
      </div>

      {/* Class Students Modal/Section */}
      {selectedClassId && (
        <Card className="mt-6">
          <div className="p-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Class Students</h2>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedClassId(null)}
              >
                Close
              </Button>
            </div>
            {studentsLoading ? (
              <p>Loading students...</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Student ID
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Name
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Email
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {students?.map((student) => (
                      <tr key={student.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          {student.studentId}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          {student.firstName} {student.lastName}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          {student.email}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </Card>
      )}
    </div>
  );
}
```

#### **Step 11: Add Navigation**

Update `frontend/components/Layout/Sidebar.tsx` to include teacher dashboard link:

```typescript
// Add to navigation items
const teacherNavItems = [
  { name: 'Dashboard', href: '/teacher/dashboard', icon: DashboardIcon },
  { name: 'My Classes', href: '/teacher/classes', icon: ClassIcon },
  { name: 'Schedule', href: '/teacher/schedule', icon: ScheduleIcon },
  // ... more items
];

// Conditionally render based on user role
{user?.roles.includes(UserRole.TEACHER) && (
  <nav>
    {teacherNavItems.map((item) => (
      <Link key={item.name} href={item.href}>
        {/* Navigation item */}
      </Link>
    ))}
  </nav>
)}
```

---

## 📊 Best Practices & Patterns

### **1. Error Handling Pattern**

```typescript
// Backend
try {
  const result = await this.service.operation();
  return result;
} catch (error) {
  if (error instanceof QueryFailedError) {
    throw new ConflictException('Database constraint violation');
  }
  if (error instanceof NotFoundException) {
    throw error; // Re-throw NestJS exceptions
  }
  throw new InternalServerErrorException('Unexpected error');
}

// Frontend
const { data, error, isLoading } = useQuery({
  queryKey: ['key'],
  queryFn: fetchData,
  onError: (error) => {
    console.error('Query failed:', error);
    // Show toast notification
  },
});
```

### **2. Multi-Tenancy Pattern**

```typescript
// Always filter by schoolId in services
async findAll(schoolId: string): Promise<Entity[]> {
  return this.repository.find({
    where: { schoolId }, // Critical for data isolation
    // ... other options
  });
}
```

### **3. DTO Transformation Pattern**

```typescript
// Entity → DTO (hide sensitive data, flatten relations)
private async mapEntityToDto(entity: Entity): Promise<EntityDto> {
  const relation = await entity.relation;
  return {
    id: entity.id,
    name: entity.name,
    relationName: relation?.name || null,
    // Don't include: password, internal IDs, etc.
  };
}
```

### **4. React Query Cache Pattern**

```typescript
// Hierarchical cache keys
export const keys = {
  all: ['resource'] as const,
  lists: () => [...keys.all, 'list'] as const,
  list: (filters: string) => [...keys.lists(), { filters }] as const,
  details: () => [...keys.all, 'detail'] as const,
  detail: (id: string) => [...keys.details(), id] as const,
};

// Invalidate efficiently
queryClient.invalidateQueries({ queryKey: keys.all }); // All resource data
queryClient.invalidateQueries({ queryKey: keys.detail(id) }); // Specific item
```

### **5. Form Validation Pattern**

```typescript
// Frontend: Yup schema
const schema = yup.object().shape({
  email: yup.string().email().required(),
  name: yup.string().min(2).max(100).required(),
});

// Backend: Class validator
export class CreateDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @Length(2, 100)
  @IsNotEmpty()
  name: string;
}
```

---

## 🎯 Summary Checklist

When adding a new module/feature, follow this checklist:

### **Backend**
- [ ] Create module structure (module, controller, service)
- [ ] Define entity with TypeORM decorators
- [ ] Create DTOs (create, update, response)
- [ ] Implement service business logic
- [ ] Implement controller endpoints
- [ ] Add guards and role decorators
- [ ] Register module in app.module.ts
- [ ] Add Swagger documentation
- [ ] Write unit tests
- [ ] Test API with Postman/Swagger

### **Frontend**
- [ ] Create TypeScript type definitions
- [ ] Add API functions to lib/api.ts
- [ ] Create React Query hooks
- [ ] Create UI components
- [ ] Create page components
- [ ] Add navigation links
- [ ] Handle loading/error states
- [ ] Test user flows

---

## 📈 Architectural Visualizations

### **Request Lifecycle**

```
Browser
   ↓
[User Action]
   ↓
[React Component] ──→ [React Query Hook]
   ↓                         ↓
[Render UI]           [API Function]
   ↑                         ↓
   │                   [Axios Request]
   │                         ↓
   │                   ─────────────
   │                   ╲ Network  ╱
   │                    ─────────
   │                         ↓
   │                   [NestJS Server]
   │                         ↓
   │                   [Auth Guard] ─→ Validate JWT
   │                         ↓
   │                   [Role Guard] ─→ Check RBAC
   │                         ↓
   │                   [Controller] ─→ Route handler
   │                         ↓
   │                   [Service] ──→ Business logic
   │                         ↓
   │                   [Repository] ─→ DB query
   │                         ↓
   │                   [PostgreSQL]
   │                         │
   │                   [Return Data]
   │                         ↓
   │                   [DTO Mapping]
   │                         ↓
   │                   [JSON Response]
   │                         ↓
   └───────────────────[Update Cache]
```

### **Module Dependency Graph**

```
AppModule
├── ConfigModule (global)
├── TypeOrmModule (global)
├── AuthModule
│   └── UsersModule
├── ZitadelModule
│   └── PassportModule
├── StudentsModule
│   ├── ClassesModule
│   └── SchoolsModule
├── TeachersModule
│   ├── UsersModule
│   └── SchoolsModule
├── ClassesModule
│   ├── TeachersModule
│   ├── SubjectsModule
│   └── SchoolsModule
├── SubjectsModule
├── ClassScheduleModule
│   ├── ClassesModule
│   ├── SubjectsModule
│   └── TeachersModule
└── TeacherDashboardModule (NEW)
    ├── TeachersModule
    ├── ClassesModule
    ├── ClassScheduleModule
    └── StudentsModule
```

---

## 🔧 Development Workflow

```bash
# 1. Start infrastructure
docker-compose up -d db zitadel

# 2. Start backend
cd backend
npm install
npm run start:dev

# 3. Start frontend (new terminal)
cd frontend
npm install
npm run dev

# 4. Access applications
Backend API: http://localhost:5000/api
Swagger Docs: http://localhost:5000/api/docs
Frontend: http://localhost:3000
```

---

This guide provides a complete end-to-end understanding of your system architecture and shows exactly how to add new features with a practical teacher dashboard example. The patterns are consistent across all modules, making it scalable and maintainable.
