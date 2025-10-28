# School Admin Frontend Implementation Plan

**Date:** October 27, 2025  
**Version:** 1.0  
**Status:** Planning Phase  

---

## Executive Summary

This document outlines a comprehensive plan to implement missing School Admin features in the frontend, based on PRD requirements. The backend APIs are already implemented; this focuses on building the frontend UI/UX to enable School Admin persona (Alex) to efficiently manage teachers, students, classes, and view operational dashboards.

### Current State Assessment

**✅ Backend Status:**
- All CRUD APIs implemented for: Students, Teachers, Classes, Subjects, Users, Schools
- Multi-tenant support with `schoolId` isolation
- Zitadel authentication + RBAC guards
- DDD Phase 3 complete for Students module (v2 API available)

**⚠️ Frontend Gaps:**
- Teachers management UI is placeholder only
- No student enrollment workflow
- No teacher creation/assignment workflow
- Dashboard shows hardcoded zeros (no real data)
- Missing student bulk import (US-1 requirement)
- No class-teacher assignment interface
- No reports/analytics views

---

## PRD Requirements Mapping

### Primary Persona: School Admin (Alex)

**Goals:**
- Configure school settings
- Manage teachers and students efficiently
- Run operational reports
- Reduce admin workload by 40+ hours/month

**Key User Stories:**

| Story ID | Description | Current Status | Priority |
|----------|-------------|----------------|----------|
| US-1 | Bulk create teacher accounts from Excel | ❌ Missing | **P0** |
| US-2 | Enroll students in classes | ❌ Missing | **P0** |
| US-3 | View teacher workload dashboard | ❌ Missing | **P1** |
| US-4 | Generate student roster reports | ❌ Missing | **P1** |
| US-5 | Assign teachers to classes/subjects | ❌ Missing | **P0** |

### Functional Requirements Coverage

| FR ID | Requirement | Backend | Frontend | Gap |
|-------|-------------|---------|----------|-----|
| FR1-FR3 | Auth & RBAC | ✅ | ✅ | None |
| FR4-FR6 | Student Management | ✅ | 🟡 Partial | No enrollment UI, No bulk import |
| FR7-FR8 | Teacher Management | ✅ | ❌ | Entire UI missing |
| FR9-FR11 | Class & Subject | ✅ | ✅ | Teacher assignment missing |
| FR24-FR26 | Dashboard & Reports | ✅ API exists | ❌ | Static dashboard, no charts |

---

## Gap Analysis

### 1. Teachers Module - Complete Missing Implementation

**Current State:**
- Backend: Full CRUD API at `/api/teachers`
- Frontend: Placeholder page with "coming soon" message
- No components exist

**Missing Components:**
```
components/Teachers/
├── TeacherList.tsx          ❌ Not created
├── TeacherForm.tsx          ❌ Not created
├── TeacherCard.tsx          ❌ Not created
├── AssignClassModal.tsx     ❌ Not created
└── BulkImportTeachers.tsx   ❌ Not created (US-1)

hooks/
└── useTeachers.ts           ❌ Not created

types/
└── teacher.ts               ❌ Not created

app/admin/teachers/
├── page.tsx                 🟡 Placeholder only
├── create/page.tsx          ❌ Not created
└── [id]/page.tsx            ❌ Not created
```

### 2. Student Enrollment Workflow

**Current State:**
- Students can be created individually
- No class assignment during creation flow
- No bulk enrollment interface

**Missing Features:**
- Student-to-class assignment UI in StudentForm
- Bulk import from CSV/Excel
- Enrollment history view
- Class roster view with add/remove students

### 3. Class-Teacher Assignment

**Current State:**
- Classes can be created
- No UI to assign teachers to classes
- Backend supports M-N relationship but no frontend interface

**Missing Features:**
- Assign teacher(s) to class
- Assign teacher to specific subject within class
- View teacher's assigned classes
- Teacher workload view

### 4. Dashboard & Analytics

**Current State:**
- Static dashboard with hardcoded "0" values
- No API integration for stats
- No charts/graphs

**Missing Features:**
- Real-time statistics (student count, class count, teacher count)
- Enrollment trends chart
- Attendance summary (future)
- Fee collection status (future)
- Quick actions widget

### 5. Reports Module

**Current State:**
- Completely missing
- No backend API yet

**Required Reports (PRD FR24-FR26):**
- Student roster by class
- Teacher assignment report
- Attendance summary (future Phase 2)
- Grade distribution (future Phase 2)
- Fee collection report (future Phase 2)

---

## Implementation Phases

### Phase 1: Teachers Management (Week 1-2) **HIGHEST PRIORITY**

**Goal:** Enable School Admin to create, view, update, and delete teachers.

#### 1.1 Core Infrastructure
- [ ] Create `types/teacher.ts` interface
- [ ] Create `hooks/useTeachers.ts` with React Query
- [ ] Set up API client methods in `lib/api.ts`

#### 1.2 Teacher Components
- [ ] `TeacherList.tsx` - Table view with pagination
- [ ] `TeacherForm.tsx` - Create/Edit form with validation
- [ ] `TeacherCard.tsx` - Card view for dashboard

#### 1.3 Teacher Pages
- [ ] `/admin/teachers/page.tsx` - List all teachers
- [ ] `/admin/teachers/create/page.tsx` - Create new teacher
- [ ] `/admin/teachers/[id]/page.tsx` - Edit teacher

#### 1.4 Integration
- [ ] Connect to backend `/api/teachers` endpoints
- [ ] Add success/error notifications
- [ ] Test CRUD operations
- [ ] Add loading states

**Acceptance Criteria:**
- School Admin can create teacher with: firstName, lastName, email, employeeId, hireDate, qualification, specialization
- Teacher list shows all teachers for current school
- Can edit and delete teachers
- Form validation works (required fields, email format)
- Proper error handling and user feedback

---

### Phase 2: Student Enrollment Enhancement (Week 2-3)

**Goal:** Add class assignment during student creation and enable enrollment workflows.

#### 2.1 Enhanced Student Form
- [ ] Add class dropdown to `StudentForm.tsx`
- [ ] Load available classes for school
- [ ] Show current class assignment in edit mode
- [ ] Add "Enroll in Class" action

#### 2.2 Class Roster Management
- [ ] Create `ClassRoster.tsx` component
- [ ] Show all students in a class
- [ ] Add "Enroll Student" button
- [ ] Add "Remove Student" action
- [ ] Display enrollment date

#### 2.3 Bulk Student Import (US-1)
- [ ] Create `BulkImportStudents.tsx` component
- [ ] CSV/Excel file upload
- [ ] Data validation and preview
- [ ] Batch create students
- [ ] Error reporting for failed imports
- [ ] Download template file

#### 2.4 Student Creation Flow Enhancement
- [ ] Update `/admin/students/create/page.tsx` to include class selection
- [ ] Add validation for class assignment
- [ ] Show success message with class name

**Acceptance Criteria:**
- School Admin can assign class during student creation
- Can enroll/unenroll students from class roster view
- Bulk import accepts CSV with headers: firstName, lastName, email, dateOfBirth, studentId, classId
- Import validates data and shows preview before creating
- Shows detailed error messages for failed rows
- Successful import completes in < 30 seconds for 50 students (US-1 target)

---

### Phase 3: Class-Teacher Assignment (Week 3-4)

**Goal:** Enable assignment of teachers to classes and subjects.

#### 3.1 Class Detail Enhancement
- [ ] Add "Assigned Teachers" section to class detail page
- [ ] Show list of teachers teaching this class
- [ ] Add "Assign Teacher" button

#### 3.2 Teacher Assignment Components
- [ ] Create `AssignTeacherModal.tsx`
- [ ] Select teacher from dropdown
- [ ] Select subject(s) teacher will teach
- [ ] Save teacher-class-subject assignment

#### 3.3 Teacher Workload View
- [ ] Create `TeacherWorkload.tsx` component
- [ ] Show all classes assigned to teacher
- [ ] Show subjects per class
- [ ] Calculate total teaching hours (if schedule data available)

#### 3.4 Backend Integration
- [ ] Check if backend has teacher-class assignment API
- [ ] If missing, document required endpoints
- [ ] Implement frontend assuming endpoints exist

**Acceptance Criteria:**
- School Admin can assign multiple teachers to a class
- Each teacher can be assigned specific subjects within class
- Can view all classes assigned to a teacher
- Can remove teacher from class assignment
- UI prevents duplicate assignments

**Backend Requirements (if missing):**
```typescript
POST /api/classes/:classId/teachers
Body: { teacherId: string, subjectIds: string[] }

GET /api/classes/:classId/teachers
Response: { teacherId, firstName, lastName, subjects: [] }

DELETE /api/classes/:classId/teachers/:teacherId

GET /api/teachers/:teacherId/classes
Response: { classId, name, subjects: [] }
```

---

### Phase 4: Dynamic Dashboard (Week 4-5)

**Goal:** Replace static dashboard with real-time data and charts.

#### 4.1 Statistics API Integration
- [ ] Create dashboard stats endpoint (or use existing)
- [ ] Fetch: total students, total classes, total teachers, total schools
- [ ] Add caching (React Query with 5min staleTime)

#### 4.2 Dashboard Widgets
- [ ] Replace hardcoded values with API data
- [ ] Add loading skeletons
- [ ] Add error states
- [ ] Add "Last updated" timestamp

#### 4.3 Charts & Visualizations
- [ ] Install chart library (recharts or chart.js)
- [ ] Add enrollment trend chart (students over time)
- [ ] Add class distribution pie chart
- [ ] Add teacher-student ratio gauge

#### 4.4 Quick Actions Widget
- [ ] "Add Student" button
- [ ] "Add Teacher" button
- [ ] "Create Class" button
- [ ] "View Reports" button

**Acceptance Criteria:**
- Dashboard loads stats in < 2 seconds (PRD NFR-P1)
- Shows accurate counts for current school
- Charts visualize at least 3 months of data
- Quick actions navigate to correct pages
- Dashboard auto-refreshes on navigation back

**Backend Requirements (if missing):**
```typescript
GET /api/dashboard/stats
Response: {
  totalStudents: number,
  totalTeachers: number,
  totalClasses: number,
  enrollmentTrend: { month: string, count: number }[],
  classDistribution: { className: string, studentCount: number }[]
}
```

---

### Phase 5: Reports Module (Week 5-6)

**Goal:** Implement basic reporting functionality (PRD FR24-FR26).

#### 5.1 Reports Infrastructure
- [ ] Create `app/admin/reports/page.tsx`
- [ ] Add "Reports" navigation item to sidebar
- [ ] Create report category cards

#### 5.2 Student Reports
- [ ] Student roster by class (PDF export)
- [ ] Student list with filters (class, date range)
- [ ] Export to CSV

#### 5.3 Teacher Reports
- [ ] Teacher directory with contact info
- [ ] Teacher assignment report (classes & subjects)
- [ ] Export to CSV/PDF

#### 5.4 Class Reports
- [ ] Class enrollment summary
- [ ] Class schedule (if available)
- [ ] Subject distribution

#### 5.5 Report Components
- [ ] `ReportCard.tsx` - Report type selector
- [ ] `ReportFilters.tsx` - Date, class, teacher filters
- [ ] `ReportPreview.tsx` - Preview before download
- [ ] `ExportButton.tsx` - CSV/PDF export options

**Acceptance Criteria:**
- School Admin can generate at least 3 report types
- Reports can be filtered by date range, class, teacher
- Can preview report before downloading
- Can export as CSV or PDF
- Reports respect school_id isolation (multi-tenancy)

**Backend Requirements (if missing):**
```typescript
GET /api/reports/students?classId=&format=json|csv|pdf
GET /api/reports/teachers?format=json|csv|pdf
GET /api/reports/classes?format=json|csv|pdf
```

---

## Technical Architecture

### Frontend Stack (Current)

```
Next.js 16 (App Router)
├── React 18
├── TypeScript (strict mode)
├── TanStack Query (React Query) - API state management
├── Material UI 7 - Component library
├── Tailwind CSS - Utility styles
├── React Hook Form + Yup - Form validation
└── Axios - HTTP client
```

### Component Design Patterns

**1. List-Detail Pattern**
```tsx
app/admin/[entity]/
├── page.tsx              // List view
├── create/page.tsx       // Create form
└── [id]/page.tsx         // Edit form

components/[Entity]/
├── [Entity]List.tsx      // Table/Card grid
├── [Entity]Form.tsx      // Reusable form
└── [Entity]Card.tsx      // Summary card
```

**2. Hook Pattern**
```typescript
hooks/use[Entity].ts
├── use[Entity]s()           // GET list
├── use[Entity](id)          // GET by id
├── useCreate[Entity]()      // POST
├── useUpdate[Entity]()      // PATCH
└── useDelete[Entity]()      // DELETE
```

**3. Type Safety**
```typescript
types/[entity].ts
├── [Entity] interface          // Full entity
├── Create[Entity]Dto          // Creation payload
├── Update[Entity]Dto          // Update payload
└── [Entity]Response           // API response
```

### API Integration Pattern

**Existing Pattern (from useStudents.ts):**
```typescript
export function useStudents() {
  return useQuery({
    queryKey: studentKeys.all,
    queryFn: async () => {
      const { data } = await api.get<Student[]>('/students')
      return data
    },
  })
}

export function useCreateStudent() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (dto: CreateStudentDto) => {
      const { data } = await api.post<Student>('/students', dto)
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: studentKeys.all })
    },
  })
}
```

**Apply same pattern to Teachers, Reports, Dashboard.**

---

## UI/UX Guidelines

### Design Consistency

**Colors (from existing):**
- Primary: Blue (#3B82F6)
- Success: Green (#10B981)
- Warning: Orange (#F59E0B)
- Error: Red (#EF4444)
- Background: Gray-100 (#F3F4F6)

**Typography:**
- Headings: Font-bold, text-2xl to text-3xl
- Body: Font-normal, text-sm to text-base
- Labels: Font-medium, text-xs uppercase

**Components (reuse existing):**
- `<Button>` - Primary actions
- `<Card>` - Content containers
- `<Input>` - Form fields
- `<Notification>` - Alerts/toasts

### Responsive Design
- Mobile-first approach
- Tablet breakpoint: 768px
- Desktop breakpoint: 1024px
- Tables should stack on mobile

### Accessibility
- ARIA labels for all interactive elements
- Keyboard navigation support
- Focus indicators
- Screen reader friendly
- Color contrast ratio ≥ 4.5:1

---

## Data Models

### Teacher Type Definition

```typescript
// types/teacher.ts
export interface Teacher {
  id: string
  userId: string
  user?: {
    firstName: string
    lastName: string
    email: string
  }
  employeeId: string
  hireDate: string
  qualification?: string
  specialization?: string
  schoolId: string
  createdAt: string
  updatedAt: string
  // Computed/joined fields
  assignedClasses?: ClassAssignment[]
}

export interface ClassAssignment {
  classId: string
  className: string
  subjects: {
    subjectId: string
    subjectName: string
  }[]
}

export interface CreateTeacherDto {
  userId: string          // Must reference existing user
  employeeId: string
  hireDate: string        // ISO date
  qualification?: string
  specialization?: string
}

export interface UpdateTeacherDto {
  employeeId?: string
  hireDate?: string
  qualification?: string
  specialization?: string
}
```

### Dashboard Stats Type

```typescript
// types/dashboard.ts
export interface DashboardStats {
  totalStudents: number
  totalTeachers: number
  totalClasses: number
  totalSubjects: number
  recentEnrollments: number  // Last 7 days
  activeClasses: number      // Classes with students
}

export interface EnrollmentTrend {
  month: string              // "2025-10"
  studentCount: number
  teacherCount: number
}

export interface ClassDistribution {
  classId: string
  className: string
  studentCount: number
  capacity?: number
}
```

---

## Testing Strategy

### Unit Tests (Jest + React Testing Library)

**Coverage Targets:**
- Components: ≥80% coverage
- Hooks: ≥90% coverage
- Utils: ≥95% coverage

**Test Files:**
```
components/Teachers/
├── TeacherList.spec.tsx
├── TeacherForm.spec.tsx
└── BulkImportTeachers.spec.tsx

hooks/
└── useTeachers.spec.ts
```

**Example Test Cases:**
- TeacherList renders empty state
- TeacherList renders with data
- TeacherForm validates required fields
- TeacherForm submits valid data
- useTeachers fetches data successfully
- useCreateTeacher handles errors

### Integration Tests

**E2E Scenarios (Playwright/Cypress):**
1. School Admin logs in
2. Navigates to Teachers page
3. Creates new teacher
4. Verifies teacher appears in list
5. Edits teacher details
6. Deletes teacher
7. Verifies teacher removed from list

### Manual Testing Checklist

**Per Feature:**
- [ ] Create operation works
- [ ] Read/List operation works
- [ ] Update operation works
- [ ] Delete operation works (with confirmation)
- [ ] Validation prevents invalid data
- [ ] Error messages are clear
- [ ] Success notifications appear
- [ ] Loading states show during API calls
- [ ] Multi-tenancy isolation works (schoolId)
- [ ] Mobile responsive
- [ ] Accessible (keyboard navigation, screen reader)

---

## Migration & Rollout Plan

### Phase Rollout Strategy

**Week 1-2: Teachers (Alpha)**
- Deploy to dev environment
- Internal testing by dev team
- Gather feedback, fix bugs

**Week 3: Students Enhancement (Beta)**
- Deploy Teachers + Students to staging
- Onboard 2-3 pilot schools
- Monitor usage, collect feedback

**Week 4-5: Dashboard + Assignments (Beta)**
- Deploy full feature set to staging
- Expand to 10 pilot schools
- Performance testing (NFR-P1: < 2s load time)

**Week 6: Reports + GA Prep**
- Complete feature set in staging
- Security audit
- Load testing (1000 concurrent users)
- Prepare production deployment

**Week 7: General Availability**
- Deploy to production
- Monitor error rates
- Support pilot schools
- Gradual rollout to all schools

### Rollback Plan

**If critical issues found:**
1. Feature flags to disable new features
2. Revert to previous stable version
3. Hotfix and redeploy
4. Post-mortem analysis

---

## Success Metrics (PRD Goals)

### Quantitative Metrics

| Metric | Target | Measurement |
|--------|--------|-------------|
| Admin workload reduction | ≥40 hrs/month saved | Time tracking survey |
| Dashboard load time | <2s at p95 | Frontend monitoring (Vercel Analytics) |
| Teacher creation time | <3 minutes per teacher | Timed user testing |
| Bulk import speed | 50 students in <30s | Performance test |
| Feature adoption rate | ≥80% of schools use within 3 months | Analytics tracking |

### Qualitative Metrics

| Metric | Target | Measurement |
|--------|--------|-------------|
| User satisfaction | ≥4.5/5 stars | Post-feature survey |
| Feature completeness | 100% of PRD FR4-FR8, FR24-FR26 | Acceptance testing |
| Bug density | <1 critical bug per 1000 users | Bug tracking |
| Support tickets | <5 tickets/week after GA | Support system |

---

## Risk Assessment

### Technical Risks

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| Backend API missing for assignments | Medium | High | Document required endpoints early, coordinate with backend team |
| Performance issues with large datasets | Low | Medium | Implement pagination, virtualization, caching |
| Multi-tenancy bugs (data leakage) | Low | Critical | Thorough testing, security audit |
| Complex form validation errors | Medium | Low | Incremental validation, clear error messages |

### Schedule Risks

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| Scope creep | High | Medium | Strict phase gates, defer non-P0 features |
| Dependency on backend changes | Medium | High | Early coordination, mock APIs for parallel work |
| Pilot school feedback delays | Medium | Low | Schedule buffer, async feedback collection |

### Business Risks

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| Low adoption by schools | Low | High | User training, documentation, support |
| Competitor launches similar features | Medium | Medium | Fast iteration, unique value props |

---

## Dependencies & Blockers

### Internal Dependencies

1. **Backend APIs (BLOCKER)**
   - Need confirmation all CRUD endpoints exist for:
     - ✅ Students (exists)
     - ✅ Teachers (exists)
     - ✅ Classes (exists)
     - ❓ Teacher-Class assignment (needs verification)
     - ❓ Dashboard stats (needs verification)
     - ❌ Reports (missing, needs implementation)

2. **Design Assets (NICE-TO-HAVE)**
   - Logo/branding for school customization
   - Icon set for dashboard widgets
   - Chart templates

3. **Infrastructure (BLOCKER for Production)**
   - CSV parsing library (decision: papaparse vs csv-parser)
   - PDF generation library (decision: jsPDF vs pdfmake)
   - Chart library (decision: recharts vs chart.js vs d3)

### External Dependencies

1. **Authentication (Current Zitadel)**
   - Stable, no changes needed
   
2. **File Upload/Storage**
   - For bulk import CSV files
   - For report exports
   - Decision: Local storage vs S3

---

## Documentation Requirements

### Developer Documentation

- [ ] Teachers component API documentation
- [ ] Hook usage examples
- [ ] Type definitions reference
- [ ] Testing guidelines

### User Documentation

- [ ] School Admin user guide
- [ ] Teacher management how-to
- [ ] Bulk import guide with example CSV
- [ ] Reports guide
- [ ] FAQ

### Video Tutorials

- [ ] "Getting Started as School Admin" (5 min)
- [ ] "Adding Teachers in Bulk" (3 min)
- [ ] "Enrolling Students in Classes" (4 min)
- [ ] "Generating Reports" (3 min)

---

## Resource Requirements

### Development Team

| Role | Allocation | Duration |
|------|------------|----------|
| Frontend Engineer (Lead) | 100% | 6 weeks |
| Frontend Engineer (Support) | 50% | 4 weeks |
| Backend Engineer (API support) | 25% | 2 weeks |
| QA Engineer | 50% | 3 weeks |
| UI/UX Designer | 25% | 2 weeks |
| Product Manager | 10% | 6 weeks |

### Infrastructure

- Dev environment (existing)
- Staging environment (existing)
- Production environment (existing)
- Monitoring tools: Vercel Analytics, Sentry

---

## Next Steps (Immediate Actions)

### This Week (Oct 27 - Nov 2)

1. **Get Stakeholder Approval**
   - [ ] Review this plan with Product Manager
   - [ ] Get approval from Tech Lead
   - [ ] Confirm timeline with Engineering Manager

2. **Backend Verification**
   - [ ] Audit all backend endpoints
   - [ ] Document missing APIs
   - [ ] Create API specification for missing endpoints
   - [ ] Coordinate with backend team on timeline

3. **Development Setup**
   - [ ] Create feature branch: `feature/school-admin-phase1`
   - [ ] Set up task tracking (Jira/Linear)
   - [ ] Create component storybook (optional)

4. **Start Phase 1 (Teachers)**
   - [ ] Create `types/teacher.ts`
   - [ ] Create `hooks/useTeachers.ts`
   - [ ] Create `TeacherList.tsx` component
   - [ ] Test with backend API

---

## Appendices

### A. Backend API Endpoints Reference

**Teachers:**
- ✅ `GET /api/teachers` - List all teachers for school
- ✅ `GET /api/teachers/:id` - Get teacher by ID
- ✅ `POST /api/teachers` - Create teacher
- ✅ `PATCH /api/teachers/:id` - Update teacher
- ✅ `DELETE /api/teachers/:id` - Delete teacher

**Students:**
- ✅ `GET /api/students` - List all students
- ✅ `GET /api/students/:id` - Get student
- ✅ `POST /api/students` - Create student
- ✅ `PATCH /api/students/:id` - Update student
- ✅ `DELETE /api/students/:id` - Delete student
- ✅ `POST /api/students/:id/assign-class` - Assign to class
- ✅ `POST /api/students/:id/unassign-class` - Remove from class

**Classes:**
- ✅ `GET /api/classes` - List all classes
- ✅ `GET /api/classes/:id` - Get class
- ✅ `POST /api/classes` - Create class
- ✅ `PATCH /api/classes/:id` - Update class
- ✅ `DELETE /api/classes/:id` - Delete class

**To Be Verified:**
- ❓ `POST /api/classes/:id/teachers` - Assign teacher to class
- ❓ `GET /api/classes/:id/teachers` - Get teachers for class
- ❓ `GET /api/teachers/:id/classes` - Get classes for teacher
- ❓ `GET /api/dashboard/stats` - Dashboard statistics
- ❌ `GET /api/reports/*` - Report endpoints (missing)

### B. Example CSV Format for Bulk Import

**students_import.csv**
```csv
firstName,lastName,email,dateOfBirth,studentId,classId
John,Doe,john.doe@example.com,2010-05-15,STU001,uuid-class-1
Jane,Smith,jane.smith@example.com,2010-08-22,STU002,uuid-class-1
```

**teachers_import.csv**
```csv
firstName,lastName,email,employeeId,hireDate,qualification,specialization
Sarah,Johnson,sarah.j@school.com,EMP001,2020-01-15,M.Ed,Mathematics
Michael,Brown,michael.b@school.com,EMP002,2019-09-01,B.Sc,Science
```

---

**Document Prepared By:** AI Development Agent  
**Last Updated:** October 27, 2025  
**Next Review Date:** November 3, 2025 (after Phase 1 completion)
