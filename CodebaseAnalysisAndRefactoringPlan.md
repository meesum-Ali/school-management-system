# Codebase Analysis and Initial Refactoring Plan

This document outlines an analysis of the existing School Management System codebase against the principles defined in `DevelopmentGuidelines.md`. It also proposes an initial strategy for refactoring.

## 1. Backend Structure Analysis (`backend/src`)

The backend currently consists of the following key modules/areas:

-   **`AppModule`**: The root module.
-   **`StudentsModule`**: Manages student data (CRUD operations).
    -   **Entity**: `Student` (`student.entity.ts`) - Represents a student with fields like `id`, `firstName`, `lastName`, `dateOfBirth`, `email`, `studentId`. It correctly uses TypeORM decorators and defines unique constraints. `Student` can be considered an **Aggregate Root** for the Student domain.
    -   **Service**: `StudentsService` (`students.service.ts`) - Implements the application logic (use cases) for student operations. It directly injects and uses the TypeORM `Repository<Student>`. This aligns with NestJS conventions; in a stricter Clean Architecture interpretation, this repository would be accessed via an interface defined in the application layer.
    -   **Controller**: `StudentsController` (`students.controller.ts`) - Handles HTTP requests, delegates to `StudentsService`, and uses DTOs (`CreateStudentDto`, `UpdateStudentDto`) for data transfer and validation. This acts as the Interface Adapter layer.
    -   **DTOs**: Located in `students/dto/`, these are well-defined with `class-validator` decorators.
    -   **Module Definition**: `students.module.ts` correctly sets up dependencies.
-   **`AuthModule`**:
    -   **Service**: `AuthService` (`auth.service.ts`) - Currently focused on JWT token generation. It does not handle user creation, persistence, or role management.
-   **`UsersModule`**: Manages user data (CRUD operations), roles, and integrates with authentication.
    -   **Entity**: `User` (`user.entity.ts`) - Represents a user with fields like `id`, `username`, `email`, `password` (hashed), `roles` (enum `UserRole`), etc. Includes password hashing logic.
    -   **DTOs**: Well-defined DTOs (`CreateUserDto`, `UpdateUserDto`, `UserDto`) are present in `users/dto/` with validation.
    -   **Service**: `UsersService` (`users.service.ts`) - Implements application logic for user operations, including interaction with the `UserRepository` and mapping to DTOs.
    -   **Controller**: `UsersController` (`users.controller.ts`) - Handles HTTP requests for User CRUD, protected by `JwtAuthGuard` and `RolesGuard` (currently Admin-only).
    -   **Module Definition**: `users.module.ts` correctly sets up dependencies and exports `UsersService` for `AuthModule`.
    -   **Integration**: `AuthService` correctly utilizes `UsersService` for user validation and retrieving user details for JWT payload, including roles. `RolesGuard` provides endpoint protection based on these roles.

**Alignment with `DevelopmentGuidelines.md` (Backend):**

-   **Clean Architecture & DDD:**
    -   The `StudentsModule` provides a decent starting point. The separation into Controller (Adapter), Service (Application/Use Case), and Entity (Domain) is present.
    -   The concept of an Aggregate Root (`Student`) is identifiable.
    -   Repositories are used (via TypeORM's `Repository`).
    -   The `UsersModule` and `StudentsModule` provide good examples of separation of concerns (Controller, Service, Entity). The `User` entity, like `Student`, can be considered an Aggregate Root for its domain.
-   **Backend Philosophy (API-First):**
    -   The `StudentsController` defines clear API endpoints.
    -   DTOs with validation are used, aligning with "Well-defined Contracts" and "Data Validation."
    -   Statelessness and versioning are not explicitly detailed in the current code but can be incorporated. Security for authentication is handled by JWTs; authorization (roles/permissions) is not yet evident due to the missing `UsersModule`.

## 2. Frontend Structure Analysis (`frontend/`)

Key frontend feature areas and components:

-   **Student Management:**
    -   Components: `components/Students/StudentForm.tsx`, `components/Students/StudentList.tsx`.
    -   Pages: `pages/admin/students.tsx`, `create.tsx`, `[id].tsx`.
    -   These components use `Card`, `Button`, `Input` from `components/ui/` and are styled with Tailwind CSS. `StudentForm.tsx` uses `react-hook-form` and `yup` for validation.
-   **User Management:**
    -   Components: `components/Users/UserForm.tsx`, `components/Users/UserList.tsx`.
    -   Pages: `pages/admin/users.tsx`, and implied create/edit pages.
    -   `UserForm.tsx` also uses `react-hook-form`, `yup`, and UI components, including a `Select` for roles.
    -   `useFetchUsers` hook suggests dedicated logic for user data.
-   **API Interaction:**
    -   `utils/api.ts` defines an Axios instance and specific functions for student API calls (`fetchStudents`, `createStudent`, etc.).
    -   User-related API calls in `UserForm.tsx` (e.g., `api.get(/users/:id)`) suggest that the frontend expects User CRUD APIs.

**Alignment with `DevelopmentGuidelines.md` (Frontend):**

-   **Frontend Philosophy (User-First, Component Design):**
    -   The use of reusable UI components (`Card`, `Button`, `Input`) and a consistent form library (`react-hook-form`) across `StudentForm` and `UserForm` is good.
    -   The current structure provides a foundation for achieving a "sleek, flat, elegant, minimalist" design. The actual aesthetic depends on the specific styling of `components/ui/` and Tailwind CSS usage, which seems to be utility-first.
    -   The focus is on functionality; adherence to "minimalism" and "elegance" would require ongoing design discipline.
-   **User-Friendliness & Accessibility:**
    -   Page components (`students.tsx`) handle loading/error states. Forms include validation.
    -   Responsiveness and A11y would need specific checks beyond structural review.

## 3. Initial Ubiquitous Language

Based on current naming conventions:

-   **Student Domain:**
    -   `Student`: An individual enrolled in or managed by the school system.
    -   `StudentID` (field `studentId`): A unique business identifier assigned to a student.
    -   `FirstName`, `LastName`, `Email`, `DateOfBirth`: Core attributes defining a student.
-   **User Domain** (partially inferred for backend, present in frontend):
    -   `User`: An individual with authenticated access to the system.
    -   `Username`: The unique identifier used for login.
    -   `Email` (User's email): The email address associated with a user account.
    -   `Password`: The secret credential for user authentication.
    -   `Role`: A classification defining the user's general permissions and access level within the system (e.g., "Admin", "Teacher", "Accountant").
-   **Authentication/Authorization Domain (Supporting User):**
    -   `Token`: A JSON Web Token (JWT) used for authenticating API requests after successful login.
    -   `Login`/`Authentication`: The process of a user providing credentials to gain access.
    -   *(Future: `Permission`: A specific granular right granted to a role or user.)*

## 4. Multi-Tenancy Refactoring Update

The system has undergone a significant refactoring to support a multi-tenant architecture, enabling it to function as a SaaS platform for multiple schools. Key changes include:

-   **Introduction of `School` Entity:** A core `School` entity (`schools/entities/school.entity.ts`) has been introduced. This entity acts as the primary identifier for each tenant.
-   **Tenant ID (`schoolId`) Association:**
    -   Entities such as `User`, `Student`, `ClassEntity`, and `SubjectEntity` now include a `schoolId` foreign key, linking them to a specific `School`.
    -   This `schoolId` is used to enforce data isolation between tenants.
-   **Service Layer Modifications:**
    -   All relevant services (`UsersService`, `StudentsService`, `ClassesService`, `SubjectsService`) have been updated to be school-aware. CRUD operations and data retrieval methods now filter by or operate within the context of a `schoolId`.
    -   Unique constraints (e.g., usernames, student IDs, class names) are now generally enforced at the school level (unique within a school) rather than globally, through updated TypeORM entity indexes.
-   **Authentication and Authorization:**
    -   The `AuthService` now incorporates `schoolId` into JWT payloads.
    -   The login process can accept a `schoolIdentifier` (e.g., domain or code) to determine tenant context.
    -   A `SUPER_ADMIN` role has been introduced for system-wide operations, including managing `School` entities. School-specific `ADMIN` roles manage resources within their assigned school.
-   **Controller Layer Updates:**
    -   Controllers now extract `schoolId` from the authenticated user's context (derived from the JWT) and pass it to service methods, ensuring operations are correctly scoped.
-   **Frontend Adjustments:**
    -   The login page now includes an optional field for `schoolIdentifier`.
    -   `AuthContext` now stores and utilizes `schoolId` from the JWT.
    -   UI elements like the sidebar and page access controls (`ProtectedRoute`) are updated to be role-aware (distinguishing between `ADMIN` and `SUPER_ADMIN`) and context-aware where applicable.
    -   New UI components and pages for "Schools Management" (for `SUPER_ADMIN`) have been added.

**Alignment with `DevelopmentGuidelines.md` (Post Multi-Tenancy):**

-   **Clean Architecture & DDD:** The introduction of `schoolId` as a key tenant discriminator and the scoping of services reinforce the separation of concerns and domain modeling. The `School` entity is a new aggregate root.
-   **Backend Philosophy (API-First):** APIs now implicitly operate within a tenant context derived from the authenticated user's JWT.
-   **Ubiquitous Language Updates:**
    -   `School`: Represents a tenant in the SaaS system.
    -   `schoolId`: The UUID that links data to a specific school.
    -   `schoolIdentifier`: A user-facing string (like a domain or code) used during login to select a school context.
    -   `SUPER_ADMIN`: A global administrator role with rights to manage schools and potentially oversee the entire system.
    -   `ADMIN`: Now refers to a school-specific administrator, whose rights are confined to their `schoolId`.

**Next Steps (Post Initial Multi-Tenancy Implementation):**

1.  **Database Migrations:** Generate, review, and apply database migrations for all entity changes (addition of `schoolId`, new `School` table, updated unique constraints).
2.  **Thorough Testing:**
    -   Unit and integration tests for backend services ensuring data isolation and correct `schoolId` scoping.
    -   End-to-end tests for user flows, including:
        -   `SUPER_ADMIN` creating and managing schools.
        -   `ADMIN` managing resources within their own school.
        -   Login process with and without `schoolIdentifier`.
        -   Ensuring one school admin cannot access another school's data.
3.  **Refinement of User/School Provisioning:** Solidify the process for creating the first `SUPER_ADMIN` and the workflow for a `SUPER_ADMIN` to onboard a new school and its initial `ADMIN` user.
4.  **Frontend Polish:**
    -   Enhance UI to clearly display the current school context for `ADMIN` users.
    -   Review and test all admin UIs to ensure they correctly reflect data scoped to the logged-in user's school.

This refactoring lays the foundation for the School Management System to operate as a scalable SaaS application.
