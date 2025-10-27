# Domain-Driven Design (DDD) Module Boundaries

## Overview

This document describes the refactored architecture following Domain-Driven Design (DDD) principles to establish clear module boundaries, eliminate circular dependencies, and prepare the codebase for potential microservices extraction.

## Phase 1 Implementation - Module Boundary Refactoring ✅

### Key Changes

#### 1. **Eliminated Direct Repository Cross-Module Access**

**Before (❌ Anti-pattern):**
```typescript
// students.service.ts
@Injectable()
export class StudentsService {
  constructor(
    @InjectRepository(Student)
    private studentsRepository: Repository<Student>,
    @InjectRepository(ClassEntity)  // ❌ Direct access to another module's entity
    private classesRepository: Repository<ClassEntity>,
  ) {}
}
```

**After (✅ DDD Principle):**
```typescript
// students.service.ts
@Injectable()
export class StudentsService {
  constructor(
    @InjectRepository(Student)
    private readonly studentsRepository: Repository<Student>,
    private readonly classesService: ClassesService,  // ✅ Service layer communication
  ) {}
}
```

#### 2. **Removed Circular Dependencies**

**Circular Dependencies Resolved:**
- ✅ `AuthModule` ↔ `SchoolsModule` - Removed unnecessary imports
- ✅ `ClassesModule` ↔ `ClassScheduleModule` - Established unidirectional dependency
- ✅ All `forwardRef()` usage eliminated

**Before:**
```typescript
// classes.module.ts
@Module({
  imports: [
    forwardRef(() => ClassScheduleModule),  // ❌ Circular dependency
  ],
})
export class ClassesModule {}
```

**After:**
```typescript
// classes.module.ts
@Module({
  imports: [
    SubjectsModule,  // ✅ Clean, unidirectional dependencies
    UsersModule,
  ],
})
export class ClassesModule {}
```

#### 3. **Established Service Layer as Communication Boundary**

All inter-module communication now goes through exported services:

```typescript
// students.service.ts
async create(createStudentDto: CreateStudentDto, schoolId: string) {
  if (classId) {
    // ✅ Use service layer to validate class exists
    try {
      await this.classesService.findOne(classId, schoolId);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw new NotFoundException(`Class not found`);
      }
    }
  }
}
```

#### 4. **Query Builder for Many-to-Many Relationships**

For aggregate boundary respect, we use query builders instead of loading full entities:

```typescript
// classes.service.ts
async assignSubject(classId: string, subjectId: string, schoolId: string) {
  // Validate using service layer
  const subjectDto = await this.subjectsService.findOne(subjectId, schoolId);
  
  // Use query builder for relationship (within aggregate boundary)
  await this.classesRepository
    .createQueryBuilder()
    .relation(ClassEntity, 'subjects')
    .of(classId)
    .add(subjectId);
}
```

### Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                       CLEAN MODULE ARCHITECTURE                  │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌──────────────┐      ┌──────────────┐      ┌──────────────┐ │
│  │   Students   │      │   Classes    │      │   Subjects   │ │
│  │   Module     │─────→│   Module     │─────→│   Module     │ │
│  └──────────────┘      └──────────────┘      └──────────────┘ │
│         │                      ↑                               │
│         │                      │                               │
│         ↓                      │                               │
│  StudentsService       ClassesService       SubjectsService    │
│         │                      │                      │        │
│         ↓                      ↓                      ↓        │
│  Student Repo           Class Repo            Subject Repo     │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐  │
│  │           ClassSchedule Module (Consumer)                │  │
│  │   ┌─────────────────────────────────────────────┐       │  │
│  │   │  Depends on: Classes, Teachers, Subjects    │       │  │
│  │   │  No circular dependencies ✅                 │       │  │
│  │   └─────────────────────────────────────────────┘       │  │
│  └─────────────────────────────────────────────────────────┘  │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘

Key Principles:
✅ Unidirectional dependencies
✅ Service layer communication
✅ No direct repository access across modules
✅ Clear aggregate boundaries
```

## Module Dependency Graph

```
AuthModule
  └─> UsersModule
  └─> SchoolsModule

SchoolsModule
  └─> UsersModule

StudentsModule
  └─> ClassesModule

ClassesModule
  └─> SubjectsModule
  └─> UsersModule

SubjectsModule
  (no dependencies on other domain modules)

ClassScheduleModule
  └─> ClassesModule
  └─> TeachersModule
  └─> SubjectsModule

TeachersModule
  └─> UsersModule

UsersModule
  (no dependencies on other domain modules)
```

## DDD Principles Applied

### 1. **Bounded Contexts**
Each module represents a bounded context with clear responsibilities:
- **Students Context**: Manages student lifecycle and enrollment
- **Classes Context**: Manages class structure and subject assignments
- **Subjects Context**: Manages academic subjects
- **Teachers Context**: Manages teacher information
- **Users Context**: Manages authentication and user accounts

### 2. **Aggregate Boundaries**
- Each module owns its own data (repository access)
- Relationships between aggregates are managed through IDs, not direct object references
- Many-to-many relationships are handled within the owning aggregate

### 3. **Anti-Corruption Layer**
Services act as an anti-corruption layer:
- DTOs shield internal domain models from external consumers
- Services validate and transform data at module boundaries
- Clear contracts defined through service interfaces

### 4. **Repository Pattern**
- Repositories are private to their owning module
- Only services are exported for external consumption
- Repository implementation details are hidden

## Benefits Achieved

### ✅ **Maintainability**
- Clear module responsibilities
- Easy to understand dependencies
- Changes are localized to specific modules

### ✅ **Testability**
- Services can be mocked easily
- No complex circular dependency issues
- Clear interfaces for testing contracts

### ✅ **Scalability**
- Modules can be extracted into microservices
- Service layer provides natural API boundaries
- No tight coupling between domains

### ✅ **Type Safety**
- Service methods have clear signatures
- Compile-time verification of dependencies
- IDE autocomplete and refactoring support

## Migration to Microservices

With these changes, the codebase is now prepared for microservices extraction:

### Step 1: Identify Service Boundaries
Each module is a potential microservice:
- Students Service
- Classes Service
- Subjects Service
- Teachers Service
- Schools Service

### Step 2: Introduce Event Bus (Phase 2)
Replace synchronous service calls with async events:
```typescript
// Instead of:
await this.classesService.findOne(classId, schoolId);

// Use events:
eventBus.publish('class.validation.requested', { classId, schoolId });
```

### Step 3: Separate Databases (Phase 3)
Each service gets its own database schema:
- Remove foreign keys between service tables
- Use eventual consistency patterns
- Implement saga patterns for distributed transactions

### Step 4: Deploy Independently
Each service can be deployed as a separate container:
- Kubernetes pods
- Docker containers
- Serverless functions

## Code Quality Metrics

### Before Refactoring
- ❌ Circular dependencies: 3
- ❌ Cross-module repository access: 2
- ❌ forwardRef() usage: 4
- ❌ Tight coupling: High

### After Refactoring
- ✅ Circular dependencies: 0
- ✅ Cross-module repository access: 0
- ✅ forwardRef() usage: 0
- ✅ Tight coupling: Low

## Best Practices Going Forward

### DO ✅
- Always use service layer for cross-module communication
- Export services, not repositories
- Keep dependencies unidirectional
- Use DTOs for external interfaces
- Validate at module boundaries
- Use query builders for relationships within aggregate boundaries

### DON'T ❌
- Access repositories directly from other modules
- Create circular dependencies
- Expose entities directly to other modules
- Mix domain logic across module boundaries
- Use forwardRef() (indicates design smell)

## Interface Definitions

See `common/interfaces/domain-services.interface.ts` for documented service contracts.

## Testing Strategy

### Unit Tests
```typescript
describe('StudentsService', () => {
  let service: StudentsService;
  let mockClassesService: jest.Mocked<ClassesService>;

  beforeEach(() => {
    mockClassesService = {
      findOne: jest.fn(),
    } as any;

    service = new StudentsService(
      mockRepository,
      mockClassesService,  // ✅ Easy to mock
    );
  });
});
```

### Integration Tests
Test service communication without accessing internals:
```typescript
it('should validate class exists when creating student', async () => {
  mockClassesService.findOne.mockResolvedValue(mockClassDto);
  
  await service.create(createStudentDto, schoolId);
  
  expect(mockClassesService.findOne).toHaveBeenCalledWith(
    classId,
    schoolId,
  );
});
```

## References

- Domain-Driven Design by Eric Evans
- Implementing Domain-Driven Design by Vaughn Vernon
- NestJS Documentation: https://docs.nestjs.com/fundamentals/circular-dependency
- TypeORM Best Practices: https://typeorm.io/

## Changelog

### 2025-10-27 - Phase 1 Complete
- ✅ Removed all direct repository cross-module access
- ✅ Eliminated circular dependencies
- ✅ Established service layer boundaries
- ✅ Created domain service interfaces
- ✅ Updated all affected modules
- ✅ Build verification passed

---

**Next Phase**: Event-driven communication for true microservices readiness
