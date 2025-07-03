import React, { Suspense, lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import AdminLayout from '@/components/Layout/AdminLayout';
import ProtectedRoute from '@/components/Auth/ProtectedRoute'; // Assuming ProtectedRoute is updated
import { UserRole } from '@/types/user'; // Assuming this path is correct after moving files

// --- Public Pages ---
const Home = lazy(() => import('@/pages/index'));
const Login = lazy(() => import('@/pages/login'));
const UIShowcase = lazy(() => import('@/pages/ui-showcase'));
const Unauthorized = lazy(() => import('@/pages/unauthorized'));

// --- Admin Pages ---
// Dashboard
const AdminDashboard = lazy(() => import('@/pages/admin/dashboard'));

// Classes
const ClassList = lazy(() => import('@/pages/admin/classes/index'));
const ClassCreate = lazy(() => import('@/pages/admin/classes/create'));
const ClassDetails = lazy(() => import('@/pages/admin/classes/[id]'));

// Schools
const SchoolList = lazy(() => import('@/pages/admin/schools/index'));

// Students
const StudentList = lazy(() => import('@/pages/admin/students')); // pages/admin/students.tsx
const StudentCreate = lazy(() => import('@/pages/admin/students/create'));
const StudentDetails = lazy(() => import('@/pages/admin/students/[id]'));

// Subjects
const SubjectList = lazy(() => import('@/pages/admin/subjects/index'));
const SubjectCreate = lazy(() => import('@/pages/admin/subjects/create'));
const SubjectDetails = lazy(() => import('@/pages/admin/subjects/[id]'));

// Users
const UserList = lazy(() => import('@/pages/admin/users')); // pages/admin/users.tsx
const UserCreate = lazy(() => import('@/pages/admin/users/create'));
const UserNew = lazy(() => import('@/pages/admin/users/new')); // Special case: new.tsx
const UserDetails = lazy(() => import('@/pages/admin/users/[id]'));


// Helper for suspense fallback
const SuspenseFallback: React.FC = () => <div>Loading...</div>;

// Admin routes wrapper
const AdminRoutes: React.FC = () => (
  <ProtectedRoute requiredRoles={[UserRole.SUPER_ADMIN, UserRole.SCHOOL_ADMIN]}>
    <AdminLayout>
      <Suspense fallback={<SuspenseFallback />}>
        <Routes>
          <Route path="dashboard" element={<AdminDashboard />} />

          <Route path="classes" element={<ClassList />} />
          <Route path="classes/create" element={<ClassCreate />} />
          <Route path="classes/:id" element={<ClassDetails />} />

          <Route path="schools" element={<SchoolList />} />

          <Route path="students" element={<StudentList />} />
          <Route path="students/create" element={<StudentCreate />} />
          <Route path="students/:id" element={<StudentDetails />} />

          <Route path="subjects" element={<SubjectList />} />
          <Route path="subjects/create" element={<SubjectCreate />} />
          <Route path="subjects/:id" element={<SubjectDetails />} />

          <Route path="users" element={<UserList />} />
          <Route path="users/create" element={<UserCreate />} />
          <Route path="users/new" element={<UserNew />} />
          <Route path="users/:id" element={<UserDetails />} />

          {/* Default admin route if needed, e.g., redirect to dashboard */}
          <Route index element={<Navigate to="dashboard" replace />} />
        </Routes>
      </Suspense>
    </AdminLayout>
  </ProtectedRoute>
);

export const AppRouter: React.FC = () => {
  return (
    <Suspense fallback={<SuspenseFallback />}>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/ui-showcase" element={<UIShowcase />} />
        <Route path="/unauthorized" element={<Unauthorized />} />

        {/* Admin section routes */}
        <Route path="/admin/*" element={<AdminRoutes />} />

        {/* Add a 404 Not Found route */}
        <Route path="*" element={<div>404 - Page Not Found</div>} />
      </Routes>
    </Suspense>
  );
};
