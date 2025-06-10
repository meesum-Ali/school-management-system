# Frontend RBAC Adaptation Strategy

This document outlines the conceptual adaptations for the frontend to align with the Role-Based Access Control (RBAC) implemented in the backend. The primary goal is to provide a user experience (UX) that reflects a user's permissions, preventing confusion and clearly indicating what actions they are authorized to perform.

**Assumptions:**
-   The backend has `UsersModule` and `StudentsModule` where all CRUD operations are currently restricted to users with the `UserRole.ADMIN` role.
-   `AuthContext.tsx` provides an `AuthUser` object: `user: { id: string; username: string; roles: UserRole[] } | null`.
-   `UserRole` enum is available on the frontend (`frontend/types/user.ts`).

### 1. Conditional UI Rendering

The most immediate impact of RBAC on the frontend is controlling the visibility of UI elements based on the authenticated user's roles. This prevents users from seeing options they cannot act upon.

**A. Navigation Links (e.g., `Sidebar.tsx`)**

-   **Goal:** Only display navigation links to sections the user is permitted to access.
-   **Current:** Sidebar links (e.g., "User Management", "Student Management") are visible to any authenticated user.
-   **Adaptation:**
    -   Access the user's roles from `AuthContext`: `const { user } = useContext(AuthContext);`
    -   Wrap links that require specific roles (currently `UserRole.ADMIN` for User and Student management) in a conditional check:
        ```tsx
        // In Sidebar.tsx or similar navigation component
        {user?.roles.includes(UserRole.ADMIN) && (
          <li className='mb-2'>
            <Link href='/admin/users' className='text-blue-500'>
              User Management
            </Link>
          </li>
        )}
        {user?.roles.includes(UserRole.ADMIN) && (
          <li className='mb-2'>
            <Link href='/admin/students' className='text-blue-500'>
              Student Management
            </Link>
          </li>
        )}
        ```
    -   This ensures non-ADMIN users do not see links to these restricted admin sections.

**B. Action Buttons & UI Elements**

-   **Goal:** Hide or disable action buttons (e.g., "Create", "Edit", "Delete") if the user lacks the necessary permissions.
-   **Current:** Action buttons within `UserList.tsx` and `StudentList.tsx` (and their respective forms) are rendered regardless of user role.
-   **Adaptation:**
    -   Pass the `user` object (or just `user.roles`) from `AuthContext` down to components that contain role-restricted actions, or have these components consume `AuthContext` directly.
    -   Conditionally render buttons:
        ```tsx
        // Example in UserList.tsx (or StudentList.tsx)
        // Assuming 'userRoles' prop is passed or context is used
        {userRoles.includes(UserRole.ADMIN) && (
          <Link href="/admin/users/create" passHref>
            <Button>Create User</Button>
          </Link>
        )}
        // ...
        {userRoles.includes(UserRole.ADMIN) && (
          <>
            <Link href={`/admin/users/${user.id}`} passHref>
              <Button variant="outline" size="sm" className="mr-2">Edit</Button>
            </Link>
            <Button variant="destructive" size="sm" onClick={() => onDelete(user.id)}>
              Delete
            </Button>
          </>
        )}
        ```
    -   This applies to "Create User/Student" buttons on list pages, and "Edit/Delete" buttons within item rows.

**C. Data Display**
-   **Goal:** Potentially hide specific data fields based on roles.
-   **Current:** All data fields defined in `UserDto` or `StudentDto` are displayed if included in the list/form components.
-   **Adaptation:** While not a primary concern for the current ADMIN-only setup, in more granular systems, one might conditionally render columns in a table or fields in a detail view based on roles. For example, an `ACCOUNTANT` might see student fee information, but not disciplinary records. This would follow similar conditional rendering logic.

### 2. Page-Level Access Control (Client-Side)

While backend RBAC is the source of truth for security, client-side route protection improves UX by preventing users from accessing pages they are not authorized to view or use.

**A. `ProtectedRoute.tsx` Enhancement**

-   **Goal:** Extend `ProtectedRoute` to check not only for authentication but also for required roles if specified for a route.
-   **Current:** `ProtectedRoute` likely only checks `isAuthenticated`.
-   **Adaptation Concepts:**
    1.  **Role Prop:** `ProtectedRoute` could accept an optional `requiredRoles: UserRole[]` prop.
        ```tsx
        // In a page component like pages/admin/users.tsx
        <ProtectedRoute requiredRoles={[UserRole.ADMIN]}>
          <AdminLayout>
            <UserList ... />
          </AdminLayout>
        </ProtectedRoute>
        ```
    2.  **Logic within `ProtectedRoute`:**
        ```tsx
        // Inside ProtectedRoute.tsx
        const { isAuthenticated, user, isLoading } = useContext(AuthContext);
        // ... (existing auth check and loading state handling) ...

        if (!isLoading && isAuthenticated && requiredRoles && requiredRoles.length > 0) {
          const hasRequiredRole = requiredRoles.some(role => user?.roles.includes(role));
          if (!hasRequiredRole) {
            router.push('/unauthorized'); // Or a generic "access denied" page
            return null; // Or a loading/message component
          }
        }
        // ... (return children if all checks pass) ...
        ```
    - This provides a basic client-side mechanism to redirect users if they lack the necessary roles for a page, complementing the UI element hiding.

### 3. Handling Backend 403 Forbidden Errors

If client-side checks are bypassed or fail, or if a user crafts a request, the backend will return a `403 Forbidden` status.

**A. API Utility Functions & Error Handling**

-   **Goal:** Gracefully handle and communicate 403 errors to the user.
-   **Current:** API calls in `frontend/utils/api.ts` use Axios. Axios errors are caught in page components, typically setting a generic error message.
-   **Adaptation:**
    -   The existing error handling in page components (e.g., `setError(errorMessage)`) can be made more specific for 403 errors.
        ```tsx
        // Example in a page component's catch block
        if (axios.isAxiosError(err) && err.response?.status === 403) {
          setError("Access Denied: You do not have permission to perform this action.");
        } else {
          setError(err instanceof Error ? err.message : "An unexpected error occurred.");
        }
        ```
    -   The `Notification` component can then display this more specific message.

### 4. Current Scenario: A `TEACHER` Logs In

-   **Authentication:** The `TEACHER` (assuming they are a `User` with role `[UserRole.TEACHER]`) would successfully log in, as authentication does not yet restrict by role, only valid credentials. `AuthContext` would have `isAuthenticated: true` and `user: { ..., roles: [UserRole.TEACHER] }`.
-   **UI Visibility (with adaptations):**
    -   **Sidebar:** They would *not* see "User Management" or "Student Management" links if these are wrapped with `user?.roles.includes(UserRole.ADMIN)`. They might see "Dashboard" or other general links.
    -   **Action Buttons:** If they navigate to a page where buttons are conditionally rendered (e.g., a future page they *can* see but with some admin-only actions), those admin-only buttons would be hidden.
-   **Page Access (with adaptations):**
    -   If they attempt to navigate directly to `/admin/users` or `/admin/students` (which would be protected by `ProtectedRoute` with `requiredRoles={[UserRole.ADMIN]}`), they would be redirected to an `/unauthorized` page or back to their dashboard.
-   **API Calls (if client-side protection is bypassed):**
    -   If the `TEACHER` somehow triggers an API call to, for example, `POST /api/users` (create user), the backend's `RolesGuard` would reject the request with a `403 Forbidden` error. The frontend would then display an "Access Denied" message as per the error handling above.

### 5. Availability of Roles in `AuthContext`

-   `AuthContext.tsx` (after recent refactoring) stores `user: { id, username, roles }` in its state, where `roles` is an array of `UserRole`.
-   This `user.roles` array is directly available to any component that consumes the `AuthContext` using `useContext(AuthContext)`, making it readily available for all conditional rendering and client-side route protection logic.

### Future Considerations

As the application evolves:
-   **Granular Permissions:** The simple `UserRole.ADMIN` check will expand. `RolesGuard` already supports multiple roles (`@Roles(UserRole.ADMIN, UserRole.TEACHER)`).
-   **Teacher/Accountant/Student/Parent Views:**
    -   Teachers might see a filtered list of students (e.g., those in their classes) via a modified `GET /api/students` endpoint (which would need backend logic to filter based on the teacher's ID and assignments). Their UI would be tailored accordingly.
    -   Accountants might have specific views for financial data.
    -   Students/Parents would have their own portals with very specific, restricted data views.
-   **Component-Level RBAC:** For components used in multiple places with varying permission needs, props could be used to dictate visibility of internal elements, or the component itself could consume `AuthContext` for finer-grained control.

This conceptual plan provides a roadmap for integrating RBAC checks into the frontend, creating a more permission-aware and user-friendly experience that complements the backend's security. The immediate changes would focus on hiding admin links/buttons and protecting admin routes for non-admin users.
