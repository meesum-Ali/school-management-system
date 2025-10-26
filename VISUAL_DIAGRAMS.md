# Visual Architecture Diagrams

## 🎨 System Architecture Diagrams

### 1. High-Level System Architecture

```
┌─────────────────────────────────────────────────────────────────────────┐
│                              PRESENTATION LAYER                          │
│  ┌───────────────────────────────────────────────────────────────────┐  │
│  │                     Next.js 14 Frontend                           │  │
│  │                                                                   │  │
│  │  ┏━━━━━━━━━━━━┓  ┏━━━━━━━━━━━┓  ┏━━━━━━━━━━━┓  ┏━━━━━━━━━━━┓  │  │
│  │  ┃   Admin    ┃  ┃  Teacher   ┃  ┃  Student   ┃  ┃   Auth     ┃  │  │
│  │  ┃  Portal    ┃  ┃  Portal    ┃  ┃  Portal    ┃  ┃   Pages    ┃  │  │
│  │  ┗━━━━━━━━━━━━┛  ┗━━━━━━━━━━━┛  ┗━━━━━━━━━━━┛  ┗━━━━━━━━━━━┛  │  │
│  │         ↓               ↓               ↓               ↓         │  │
│  │  ┌─────────────────────────────────────────────────────────────┐  │  │
│  │  │           React Query (State Management & Caching)          │  │  │
│  │  └─────────────────────────────────────────────────────────────┘  │  │
│  │         ↓               ↓               ↓               ↓         │  │
│  │  ┌─────────────────────────────────────────────────────────────┐  │  │
│  │  │                 Axios HTTP Client + JWT Auth                │  │  │
│  │  └─────────────────────────────────────────────────────────────┘  │  │
│  └───────────────────────────────────────────────────────────────────┘  │
└──────────────────────────────────┬──────────────────────────────────────┘
                                   │
                         HTTPS/REST API
                         JWT Bearer Token
                                   │
┌──────────────────────────────────┼──────────────────────────────────────┐
│                                  ↓                                       │
│  ┌───────────────────────────────────────────────────────────────────┐  │
│  │                        API GATEWAY LAYER                          │  │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────────┐  │  │
│  │  │   Swagger   │  │    CORS     │  │   Global Validation     │  │  │
│  │  │    Docs     │  │  Middleware │  │      (Pipes)            │  │  │
│  │  └─────────────┘  └─────────────┘  └─────────────────────────┘  │  │
│  └───────────────────────────────────────────────────────────────────┘  │
│                                  ↓                                       │
│  ┌───────────────────────────────────────────────────────────────────┐  │
│  │                     SECURITY & AUTH LAYER                         │  │
│  │  ┌──────────────────┐  ┌─────────────────┐  ┌─────────────────┐ │  │
│  │  │  Zitadel OIDC    │  │  Auth Guard     │  │   Role Guard    │ │  │
│  │  │  JWT Validation  │→ │  (Passport)     │→ │   (RBAC)        │ │  │
│  │  └──────────────────┘  └─────────────────┘  └─────────────────┘ │  │
│  └───────────────────────────────────────────────────────────────────┘  │
│                                  ↓                                       │
│  ┌───────────────────────────────────────────────────────────────────┐  │
│  │                       CONTROLLER LAYER                            │  │
│  │   ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌───────┐ │  │
│  │   │ Students │ │ Teachers │ │  Classes │ │ Subjects │ │  ...  │ │  │
│  │   │Controller│ │Controller│ │Controller│ │Controller│ │       │ │  │
│  │   └────┬─────┘ └────┬─────┘ └────┬─────┘ └────┬─────┘ └───────┘ │  │
│  └────────┼────────────┼────────────┼────────────┼──────────────────┘  │
│           │            │            │            │                     │
│  ┌────────┼────────────┼────────────┼────────────┼──────────────────┐  │
│  │        ↓            ↓            ↓            ↓                  │  │
│  │              BUSINESS LOGIC / SERVICE LAYER                      │  │
│  │   ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐          │  │
│  │   │ Students │ │ Teachers │ │  Classes │ │ Subjects │          │  │
│  │   │ Service  │ │ Service  │ │ Service  │ │ Service  │          │  │
│  │   └────┬─────┘ └────┬─────┘ └────┬─────┘ └────┬─────┘          │  │
│  └────────┼────────────┼────────────┼────────────┼──────────────────┘  │
│           │            │            │            │                     │
│  ┌────────┼────────────┼────────────┼────────────┼──────────────────┐  │
│  │        ↓            ↓            ↓            ↓                  │  │
│  │              DATA ACCESS LAYER (TypeORM)                         │  │
│  │   ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐          │  │
│  │   │ Student  │ │ Teacher  │ │  Class   │ │ Subject  │          │  │
│  │   │Repository│ │Repository│ │Repository│ │Repository│          │  │
│  │   └────┬─────┘ └────┬─────┘ └────┬─────┘ └────┬─────┘          │  │
│  └────────┼────────────┼────────────┼────────────┼──────────────────┘  │
└───────────┼────────────┼────────────┼────────────┼───────────────────────┘
            │            │            │            │
            └────────────┴────────────┴────────────┘
                             ↓
┌─────────────────────────────────────────────────────────────────────────┐
│                         DATA PERSISTENCE LAYER                          │
│  ┌───────────────────────────────────────────────────────────────────┐  │
│  │                         PostgreSQL Database                       │  │
│  │  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐             │  │
│  │  │ schools │  │  users  │  │students │  │teachers │             │  │
│  │  └─────────┘  └─────────┘  └─────────┘  └─────────┘             │  │
│  │  ┌─────────┐  ┌─────────┐  ┌──────────┐  ┌──────────┐           │  │
│  │  │ classes │  │subjects │  │schedules │  │    ...   │           │  │
│  │  └─────────┘  └─────────┘  └──────────┘  └──────────┘           │  │
│  │                                                                   │  │
│  │  Multi-Tenant Data Isolation via schoolId                        │  │
│  └───────────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────────┘

                         ┌─────────────────┐
                         │  Zitadel OIDC   │
                         │  Auth Provider  │
                         └─────────────────┘
                               (External)
```

---

## 2. Authentication & Authorization Flow

```
┌──────────────┐
│    USER      │
└──────┬───────┘
       │ 1. Clicks Login
       ↓
┌────────────────────────────────────────────────────┐
│          Frontend (Next.js)                        │
│  ┌──────────────────────────────────────────────┐ │
│  │  Login Page: /auth/login                     │ │
│  │                                              │ │
│  │  2. Redirect to Zitadel                     │ │
│  └──────────────────────────────────────────────┘ │
└────────────────┬───────────────────────────────────┘
                 │
                 ↓
┌────────────────────────────────────────────────────┐
│         Zitadel Auth Provider                      │
│  ┌──────────────────────────────────────────────┐ │
│  │  3. User enters credentials                  │ │
│  │  4. Validates username/password              │ │
│  │  5. Checks organization membership           │ │
│  │  6. Returns authorization code               │ │
│  └──────────────────────────────────────────────┘ │
└────────────────┬───────────────────────────────────┘
                 │
                 ↓
┌────────────────────────────────────────────────────┐
│          Backend (NestJS)                          │
│  ┌──────────────────────────────────────────────┐ │
│  │  7. Exchange code for JWT token              │ │
│  │                                              │ │
│  │  JWT Payload:                                │ │
│  │  {                                           │ │
│  │    "sub": "user-uuid",                       │ │
│  │    "email": "admin@school.com",              │ │
│  │    "urn:zitadel:iam:org:project:roles": {    │ │
│  │      "SCHOOL_ADMIN": {...}                   │ │
│  │    },                                        │ │
│  │    "urn:zitadel:iam:org:id": "school-uuid",  │ │
│  │    "exp": 1234567890                         │ │
│  │  }                                           │ │
│  │                                              │ │
│  │  8. Validate JWT signature (JWKS)           │ │
│  │  9. Extract user info                        │ │
│  └──────────────────────────────────────────────┘ │
└────────────────┬───────────────────────────────────┘
                 │
                 ↓
┌────────────────────────────────────────────────────┐
│          Frontend (Next.js)                        │
│  ┌──────────────────────────────────────────────┐ │
│  │  10. Store JWT in localStorage + cookie      │ │
│  │  11. Initialize AuthProvider                 │ │
│  │                                              │ │
│  │  AuthContext State:                          │ │
│  │  {                                           │ │
│  │    isAuthenticated: true,                    │ │
│  │    user: {                                   │ │
│  │      id: "user-uuid",                        │ │
│  │      email: "admin@school.com",              │ │
│  │      roles: ["SCHOOL_ADMIN"],                │ │
│  │      schoolId: "school-uuid"                 │ │
│  │    }                                         │ │
│  │  }                                           │ │
│  │                                              │ │
│  │  12. Redirect to dashboard                   │ │
│  └──────────────────────────────────────────────┘ │
└────────────────┬───────────────────────────────────┘
                 │
                 ↓
┌────────────────────────────────────────────────────┐
│     Subsequent API Requests                        │
│  ┌──────────────────────────────────────────────┐ │
│  │  Request Headers:                            │ │
│  │  Authorization: Bearer <JWT_TOKEN>           │ │
│  │                                              │ │
│  │  Backend validates on each request:          │ │
│  │  ├─ JWT signature valid?                     │ │
│  │  ├─ Token not expired?                       │ │
│  │  ├─ User has required role?                  │ │
│  │  └─ User belongs to correct school?          │ │
│  └──────────────────────────────────────────────┘ │
└────────────────────────────────────────────────────┘
```

---

## 3. Data Flow: Create Student Example

```
┌─────────────────────────────────────────────────────────────────────┐
│  STEP 1: User Interaction                                           │
└─────────────────────────────────────────────────────────────────────┘

Admin navigates to: /admin/students/create
    ↓
StudentForm component renders
    ↓
Admin fills form:
  - First Name: "John"
  - Last Name: "Doe"
  - Email: "john.doe@school.com"
  - Date of Birth: "2010-05-15"
  - Student ID: "S2025001"
  - Class: "Grade 10A"
    ↓
Admin clicks "Submit"


┌─────────────────────────────────────────────────────────────────────┐
│  STEP 2: Frontend Validation                                        │
└─────────────────────────────────────────────────────────────────────┘

React Hook Form + Yup validation:
    ✓ First Name: required, string
    ✓ Last Name: required, string
    ✓ Email: required, valid email format
    ✓ Date of Birth: required, valid date
    ✓ Student ID: required, string
    ✓ Class ID: optional, valid UUID
    ↓
Form data prepared:
{
  firstName: "John",
  lastName: "Doe",
  email: "john.doe@school.com",
  dateOfBirth: "2010-05-15",
  studentId: "S2025001",
  classId: "class-uuid-123"
}


┌─────────────────────────────────────────────────────────────────────┐
│  STEP 3: React Query Mutation                                       │
└─────────────────────────────────────────────────────────────────────┘

// hooks/useStudents.ts
const createMutation = useCreateStudent();
createMutation.mutate(formData);
    ↓
Triggers: createStudent(formData)
    ↓
// lib/api.ts
POST /api/students
Headers: {
  "Authorization": "Bearer <JWT>",
  "Content-Type": "application/json"
}
Body: {
  "firstName": "John",
  "lastName": "Doe",
  "email": "john.doe@school.com",
  "dateOfBirth": "2010-05-15",
  "studentId": "S2025001",
  "classId": "class-uuid-123"
}


┌─────────────────────────────────────────────────────────────────────┐
│  STEP 4: Backend Request Processing                                 │
└─────────────────────────────────────────────────────────────────────┘

Request arrives at NestJS
    ↓
Route matching: POST /api/students
    ↓
GUARD 1: AuthGuard('zitadel')
  ├─ Validates JWT token
  ├─ Extracts: { id, email, roles: ["SCHOOL_ADMIN"], schoolId }
  └─ Attaches to req.user
    ↓
GUARD 2: RolesGuard
  ├─ Checks @Roles(UserRole.SCHOOL_ADMIN)
  ├─ Verifies req.user.roles includes SCHOOL_ADMIN
  └─ ✓ Authorized
    ↓
VALIDATION PIPE: GlobalValidationPipe
  ├─ Validates against CreateStudentDto
  ├─ Checks class-validator decorators:
  │   @IsNotEmpty() firstName ✓
  │   @IsNotEmpty() lastName ✓
  │   @IsEmail() email ✓
  │   @IsDateString() dateOfBirth ✓
  │   @IsNotEmpty() studentId ✓
  │   @IsUUID() @IsOptional() classId ✓
  └─ ✓ All validations pass
    ↓
Controller method executes:
// students.controller.ts
@Post()
async create(@Body() dto: CreateStudentDto, @Req() req) {
  const schoolId = req.user.schoolId;  // Extract tenant ID
  return this.studentsService.create(dto, schoolId);
}


┌─────────────────────────────────────────────────────────────────────┐
│  STEP 5: Service Layer Processing                                   │
└─────────────────────────────────────────────────────────────────────┘

// students.service.ts
async create(dto: CreateStudentDto, schoolId: string) {
  
  // Business Rule 1: Check uniqueness within school
  const existing = await this.studentsRepository.findOne({
    where: [
      { studentId: "S2025001", schoolId },
      { email: "john.doe@school.com", schoolId }
    ]
  });
  
  if (existing) {
    throw new ConflictException("Student ID or email already exists");
  }
  
  // Business Rule 2: Validate class exists in same school
  if (dto.classId) {
    const classExists = await this.classesRepository.findOne({
      where: { id: dto.classId, schoolId }
    });
    if (!classExists) {
      throw new NotFoundException("Class not found");
    }
  }
  
  // Create student entity
  const student = this.studentsRepository.create({
    ...dto,
    schoolId  // Enforce multi-tenancy
  });
  
  // Save to database
  const saved = await this.studentsRepository.save(student);
  
  // Fetch with relations
  const studentWithRelations = await this.studentsRepository.findOne({
    where: { id: saved.id },
    relations: ['currentClass']
  });
  
  // Map to DTO
  return this.mapStudentToStudentDto(studentWithRelations);
}


┌─────────────────────────────────────────────────────────────────────┐
│  STEP 6: Database Transaction                                       │
└─────────────────────────────────────────────────────────────────────┘

TypeORM generates SQL:

BEGIN TRANSACTION;

INSERT INTO students (
  id, firstName, lastName, email, dateOfBirth,
  studentId, classId, schoolId, createdAt, updatedAt
) VALUES (
  'generated-uuid',
  'John',
  'Doe',
  'john.doe@school.com',
  '2010-05-15',
  'S2025001',
  'class-uuid-123',
  'school-uuid-456',
  NOW(),
  NOW()
) RETURNING *;

SELECT 
  s.*,
  c.id as class_id, c.name as class_name
FROM students s
LEFT JOIN classes c ON s.classId = c.id
WHERE s.id = 'generated-uuid';

COMMIT;

PostgreSQL response:
[
  {
    id: 'generated-uuid',
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@school.com',
    dateOfBirth: '2010-05-15',
    studentId: 'S2025001',
    classId: 'class-uuid-123',
    schoolId: 'school-uuid-456',
    createdAt: '2025-10-26T10:30:00Z',
    updatedAt: '2025-10-26T10:30:00Z',
    class_id: 'class-uuid-123',
    class_name: 'Grade 10A'
  }
]


┌─────────────────────────────────────────────────────────────────────┐
│  STEP 7: Response Transformation                                    │
└─────────────────────────────────────────────────────────────────────┘

Service maps entity to DTO:

private async mapStudentToStudentDto(student: Student): Promise<StudentDto> {
  const currentClass = await student.currentClass;
  return {
    id: student.id,
    firstName: student.firstName,
    lastName: student.lastName,
    email: student.email,
    dateOfBirth: student.dateOfBirth,
    studentId: student.studentId,
    classId: student.classId,
    currentClassName: currentClass?.name || null,
    schoolId: student.schoolId,
    createdAt: student.createdAt,
    updatedAt: student.updatedAt
  };
}

Response DTO:
{
  "id": "generated-uuid",
  "firstName": "John",
  "lastName": "Doe",
  "email": "john.doe@school.com",
  "dateOfBirth": "2010-05-15",
  "studentId": "S2025001",
  "classId": "class-uuid-123",
  "currentClassName": "Grade 10A",
  "schoolId": "school-uuid-456",
  "createdAt": "2025-10-26T10:30:00Z",
  "updatedAt": "2025-10-26T10:30:00Z"
}

Controller returns → NestJS serializes to JSON


┌─────────────────────────────────────────────────────────────────────┐
│  STEP 8: Frontend Response Handling                                 │
└─────────────────────────────────────────────────────────────────────┘

Axios receives: HTTP 201 Created
Body: { ...student DTO... }
    ↓
React Query mutation onSuccess callback:
    ├─ Invalidate cache: queryClient.invalidateQueries(['students'])
    ├─ Forces refetch of student list
    └─ Updates UI immediately
    ↓
Navigation: router.push('/admin/students')
    ↓
StudentList component:
    ├─ Detects cache invalidation
    ├─ Refetches students list
    ├─ Renders updated table with new student
    └─ Shows success notification


┌─────────────────────────────────────────────────────────────────────┐
│  USER SEES                                                           │
└─────────────────────────────────────────────────────────────────────┘

✓ Success notification: "Student created successfully"
✓ Redirected to /admin/students
✓ Table shows new student "John Doe" at top of list
✓ Can immediately edit/delete the new student
```

---

## 4. Module Dependency Graph

```
                         ┌─────────────────┐
                         │   AppModule     │
                         │   (Root)        │
                         └────────┬────────┘
                                  │
                    ┌─────────────┼─────────────┐
                    │             │             │
         ┌──────────▼──────┐     │     ┌───────▼────────┐
         │  ConfigModule    │     │     │  TypeOrmModule │
         │  (Global)        │     │     │  (Global)      │
         └──────────────────┘     │     └────────────────┘
                                  │
         ┌────────────────────────┼────────────────────────┐
         │                        │                        │
    ┌────▼─────┐          ┌──────▼──────┐         ┌──────▼──────┐
    │  Auth    │          │   Zitadel   │         │   Health    │
    │  Module  │          │   Module    │         │   Module    │
    └────┬─────┘          └─────────────┘         └─────────────┘
         │
         │ depends on
         ↓
    ┌────────────┐
    │   Users    │
    │   Module   │
    └────┬───────┘
         │
         │ used by
         ↓
    ┌──────────────────────────────────────────────────────┐
    │                                                      │
┌───▼──────┐   ┌──────────┐   ┌──────────┐   ┌──────────┐
│ Students │   │ Teachers │   │ Classes  │   │ Subjects │
│  Module  │   │  Module  │   │  Module  │   │  Module  │
└───┬──────┘   └────┬─────┘   └────┬─────┘   └────┬─────┘
    │               │              │              │
    │ depends on    │              │              │
    ↓               ↓              ↓              ↓
┌────────────┐ ┌────────────┐ ┌────────────┐ ┌────────────┐
│  Schools   │ │  Schools   │ │  Schools   │ │  Schools   │
│  Module    │ │  Module    │ │  Module    │ │  Module    │
└────────────┘ └────────────┘ └────────────┘ └────────────┘

         Students, Teachers, Classes used by
                         ↓
              ┌──────────────────┐
              │  ClassSchedule   │
              │     Module       │
              └────────┬─────────┘
                       │
         ┌─────────────┴─────────────┐
         ↓                           ↓
┌──────────────────┐      ┌──────────────────┐
│  TeacherDashboard│      │  StudentPortal   │
│      Module      │      │     Module       │
└──────────────────┘      └──────────────────┘
```

---

## 5. Multi-Tenancy Data Isolation

```
┌─────────────────────────────────────────────────────────────────────┐
│                         DATABASE SCHEMA                             │
└─────────────────────────────────────────────────────────────────────┘

schools table:
┌──────────────┬──────────┬──────────────┬──────────────┐
│      id      │   name   │   domain     │   settings   │
├──────────────┼──────────┼──────────────┼──────────────┤
│ school-A-id  │ School A │ school-a.com │ {...}        │
│ school-B-id  │ School B │ school-b.com │ {...}        │
└──────────────┴──────────┴──────────────┴──────────────┘

users table:
┌──────────────┬─────────┬───────────────┬──────────────┐
│      id      │  email  │     role      │   schoolId   │
├──────────────┼─────────┼───────────────┼──────────────┤
│ admin-A-id   │ admin@A │ SCHOOL_ADMIN  │ school-A-id  │ ← School A admin
│ teacher-A-id │ teach@A │ TEACHER       │ school-A-id  │ ← School A teacher
│ admin-B-id   │ admin@B │ SCHOOL_ADMIN  │ school-B-id  │ ← School B admin
│ teacher-B-id │ teach@B │ TEACHER       │ school-B-id  │ ← School B teacher
└──────────────┴─────────┴───────────────┴──────────────┘

students table:
┌──────────────┬───────────┬──────────────┬──────────────┐
│      id      │   name    │   classId    │   schoolId   │
├──────────────┼───────────┼──────────────┼──────────────┤
│ student-A1   │ John Doe  │ class-A1     │ school-A-id  │ ← School A
│ student-A2   │ Jane Doe  │ class-A1     │ school-A-id  │ ← School A
│ student-B1   │ Bob Smith │ class-B1     │ school-B-id  │ ← School B
└──────────────┴───────────┴──────────────┴──────────────┘


┌─────────────────────────────────────────────────────────────────────┐
│                    DATA ISOLATION MECHANISM                         │
└─────────────────────────────────────────────────────────────────────┘

Request Flow:
1. User (admin@A) logs in
2. JWT contains: { schoolId: "school-A-id" }
3. Every API call includes this schoolId
4. All database queries filtered by schoolId

Example Query:
SELECT * FROM students WHERE schoolId = 'school-A-id'
                                         ↑
                                   Automatic filter

Result:
┌──────────────┬───────────┬──────────────┬──────────────┐
│      id      │   name    │   classId    │   schoolId   │
├──────────────┼───────────┼──────────────┼──────────────┤
│ student-A1   │ John Doe  │ class-A1     │ school-A-id  │ ✓
│ student-A2   │ Jane Doe  │ class-A1     │ school-A-id  │ ✓
└──────────────┴───────────┴──────────────┴──────────────┘

student-B1 is NOT returned (different schoolId)


┌─────────────────────────────────────────────────────────────────────┐
│                    CROSS-TENANT ATTACK PREVENTION                   │
└─────────────────────────────────────────────────────────────────────┘

Scenario: Malicious admin@A tries to access School B's student

Request:
GET /api/students/student-B1
Authorization: Bearer <admin-A-token>

Processing:
1. JWT decoded: schoolId = "school-A-id"
2. Service queries:
   SELECT * FROM students 
   WHERE id = 'student-B1' 
   AND schoolId = 'school-A-id'
                  ↑
            Security filter

3. Result: Empty (student-B1 has schoolId = "school-B-id")
4. Response: 404 Not Found

✓ Cross-tenant access BLOCKED
✓ Attacker gets no information about existence
```

---

## 6. Frontend Component Hierarchy

```
app/
├── layout.tsx (Root Layout)
│   ├── <ReactQueryProvider>
│   │   ├── <ThemeProvider>
│   │   │   ├── <AuthProvider>
│   │   │   │   └── {children}
│   │   │   │
│   │   │   └── Provides:
│   │   │       - isAuthenticated
│   │   │       - user: { id, email, roles, schoolId }
│   │   │       - login()
│   │   │       - logout()
│   │   │
│   │   └── Provides:
│   │       - MUI Theme
│   │       - Dark/Light mode
│   │
│   └── Provides:
│       - React Query Client
│       - Query cache
│       - Mutation handling
│
├── page.tsx (Landing Page)
│
├── admin/
│   ├── layout.tsx (Admin Layout)
│   │   └── <AdminLayout>
│   │       ├── <Navbar>
│   │       │   ├── Logo
│   │       │   ├── User Menu
│   │       │   └── Logout Button
│   │       │
│   │       ├── <Sidebar>
│   │       │   ├── Dashboard Link
│   │       │   ├── Students Link
│   │       │   ├── Teachers Link
│   │       │   ├── Classes Link
│   │       │   ├── Subjects Link
│   │       │   └── Settings Link
│   │       │
│   │       └── <main>
│   │           └── {children}
│   │
│   ├── dashboard/page.tsx
│   │   └── Dashboard stats & charts
│   │
│   ├── students/
│   │   ├── page.tsx (List View)
│   │   │   ├── useStudents() hook
│   │   │   └── <StudentList>
│   │   │       ├── <Table>
│   │   │       └── <Button> Create/Edit/Delete
│   │   │
│   │   ├── create/page.tsx
│   │   │   ├── useCreateStudent() hook
│   │   │   ├── useClasses() hook (for dropdown)
│   │   │   └── <StudentForm>
│   │   │       ├── React Hook Form
│   │   │       ├── Yup validation
│   │   │       └── Input fields
│   │   │
│   │   └── [id]/page.tsx (Edit View)
│   │       ├── useStudent(id) hook
│   │       ├── useUpdateStudent() hook
│   │       └── <StudentForm>
│   │
│   ├── teachers/
│   │   └── (Similar structure to students)
│   │
│   ├── classes/
│   │   └── (Similar structure to students)
│   │
│   └── subjects/
│       └── (Similar structure to students)
│
├── teacher/
│   ├── layout.tsx (Teacher Layout)
│   │   └── Teacher-specific navigation
│   │
│   ├── dashboard/page.tsx
│   │   ├── useTeacherDashboard() hook
│   │   ├── <DashboardSummary>
│   │   ├── <ClassList>
│   │   └── <TodaySchedule>
│   │
│   └── classes/
│       └── View assigned classes
│
├── student/
│   ├── layout.tsx (Student Layout)
│   │   └── Student-specific navigation
│   │
│   ├── dashboard/page.tsx
│   │   └── Student overview
│   │
│   └── grades/
│       └── View grades
│
└── auth/
    ├── login/page.tsx
    ├── callback/page.tsx
    └── unauthorized/page.tsx
```

---

## 7. React Query Cache Structure

```
┌─────────────────────────────────────────────────────────────────────┐
│                     REACT QUERY CACHE                               │
└─────────────────────────────────────────────────────────────────────┘

Query Cache (In-Memory):
{
  queries: [
    {
      queryKey: ['students'],
      queryHash: 'students',
      state: {
        data: [
          { id: '1', name: 'John Doe', ... },
          { id: '2', name: 'Jane Doe', ... },
          ...
        ],
        status: 'success',
        dataUpdatedAt: 1698765432000,
        isInvalidated: false,
        staleTime: 300000, // 5 minutes
      }
    },
    {
      queryKey: ['students', '1'],
      queryHash: 'students.1',
      state: {
        data: { id: '1', name: 'John Doe', ... },
        status: 'success',
        dataUpdatedAt: 1698765435000,
        isInvalidated: false
      }
    },
    {
      queryKey: ['classes'],
      queryHash: 'classes',
      state: {
        data: [
          { id: 'class-1', name: 'Grade 10A', ... },
          ...
        ],
        status: 'success'
      }
    }
  ],
  mutations: [
    {
      mutationId: 1,
      state: {
        status: 'idle'
      }
    }
  ]
}


┌─────────────────────────────────────────────────────────────────────┐
│                  CACHE INVALIDATION FLOW                            │
└─────────────────────────────────────────────────────────────────────┘

User creates new student:
    ↓
useCreateStudent().mutate(data)
    ↓
API call: POST /api/students
    ↓
Success response received
    ↓
onSuccess callback:
    queryClient.invalidateQueries({ queryKey: ['students'] })
    ↓
React Query marks cache as stale:
    ['students'] → isInvalidated: true
    ['students', 'specific-id'] → (unchanged)
    ['classes'] → (unchanged)
    ↓
Components using useStudents() automatically refetch:
    ↓
fetchStudents() called
    ↓
New data retrieved from server
    ↓
Cache updated:
    ['students'] → new data with newly created student
    ↓
All components using this data re-render with fresh data


┌─────────────────────────────────────────────────────────────────────┐
│                  OPTIMISTIC UPDATES (Advanced)                      │
└─────────────────────────────────────────────────────────────────────┘

For instant UI feedback:

const deleteMutation = useMutation({
  mutationFn: deleteStudent,
  onMutate: async (studentId) => {
    // Cancel outgoing refetches
    await queryClient.cancelQueries(['students']);
    
    // Snapshot previous value
    const previous = queryClient.getQueryData(['students']);
    
    // Optimistically update cache
    queryClient.setQueryData(['students'], (old) =>
      old.filter(s => s.id !== studentId)
    );
    
    return { previous };
  },
  onError: (err, variables, context) => {
    // Rollback on error
    queryClient.setQueryData(['students'], context.previous);
  },
  onSettled: () => {
    // Always refetch after mutation
    queryClient.invalidateQueries(['students']);
  }
});
```

---

## 8. Error Handling Flow

```
┌─────────────────────────────────────────────────────────────────────┐
│                  BACKEND ERROR HANDLING                             │
└─────────────────────────────────────────────────────────────────────┘

Request → Controller → Service → Repository
                          ↓
                    [Error Occurs]
                          ↓
              ┌───────────┴───────────┐
              │  What type of error?  │
              └───────────┬───────────┘
                          │
        ┌─────────────────┼─────────────────┐
        │                 │                 │
        ↓                 ↓                 ↓
┌──────────────┐  ┌──────────────┐  ┌──────────────┐
│ Validation   │  │  Not Found   │  │  Database    │
│    Error     │  │    Error     │  │    Error     │
└──────┬───────┘  └──────┬───────┘  └──────┬───────┘
       │                 │                 │
       ↓                 ↓                 ↓
┌──────────────┐  ┌──────────────┐  ┌──────────────┐
│   400 Bad    │  │  404 Not     │  │   500 or     │
│   Request    │  │   Found      │  │ 409 Conflict │
└──────┬───────┘  └──────┬───────┘  └──────┬───────┘
       │                 │                 │
       └─────────────────┴─────────────────┘
                         ↓
              NestJS Exception Filter
                         ↓
              Standard Error Response:
              {
                "statusCode": 400,
                "message": "Validation failed",
                "error": "Bad Request",
                "details": [...]
              }


┌─────────────────────────────────────────────────────────────────────┐
│                  FRONTEND ERROR HANDLING                            │
└─────────────────────────────────────────────────────────────────────┘

API Request
    ↓
Axios Interceptor catches errors
    ↓
┌──────────────────────────────────────┐
│   HTTP Status Code?                  │
└──────────────┬───────────────────────┘
               │
     ┌─────────┼─────────┐
     │         │         │
     ↓         ↓         ↓
┌─────────┐ ┌──────┐ ┌──────┐
│   401   │ │  403 │ │ 4xx  │
│ Unauth  │ │Forbid│ │ 5xx  │
└────┬────┘ └───┬──┘ └───┬──┘
     │          │        │
     ↓          ↓        ↓
Clear token   Show     Show
Redirect to   error    error
login page   message  message
     │          │        │
     └──────────┴────────┘
                ↓
    React Query onError callback
                ↓
    Component error state updated
                ↓
    User sees error notification:
    
    ┌──────────────────────────────────┐
    │  ⚠️  Error                       │
    │  Failed to create student        │
    │  Email already exists            │
    │                          [Close] │
    └──────────────────────────────────┘


Example in Component:

const { data, error, isError } = useStudents();

if (isError) {
  return (
    <Notification
      type="error"
      message={error.message}
      onClose={() => {}}
    />
  );
}
```

---

This visual guide complements the main architecture document with detailed diagrams showing how each part of the system connects and communicates!
