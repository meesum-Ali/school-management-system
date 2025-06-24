import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { AuthProvider } from '../contexts/AuthContext';
import ProtectedRoute from '../components/Auth/ProtectedRoute';
import AdminLayout from '../components/Layout/AdminLayout';
import Login from '../pages/login';
import UserList from '../pages/admin/users';
import UserForm from '../pages/admin/users/[id]';
import EditUser from '../pages/admin/users/new';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route
            path="/admin/users"
            element={
              <ProtectedRoute requiredRoles={['Admin']}>
                <AdminLayout>
                  <UserList />
                </AdminLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/users/new"
            element={
              <ProtectedRoute requiredRoles={['Admin']}>
                <AdminLayout>
                  <UserForm />
                </AdminLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/users/:id"
            element={
              <ProtectedRoute requiredRoles={['Admin']}>
                <AdminLayout>
                  <EditUser />
                </AdminLayout>
              </ProtectedRoute>
            }
          />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
