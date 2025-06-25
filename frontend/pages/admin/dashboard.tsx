import React from 'react'
import ProtectedRoute from '../../components/Auth/ProtectedRoute'
import AdminLayout from '../../components/Layout/AdminLayout'
import { UserRole } from '../../types/user'

const AdminDashboard: React.FC = () => {
  return (
    <ProtectedRoute requiredRoles={[UserRole.SUPER_ADMIN, UserRole.SCHOOL_ADMIN]}>
      <AdminLayout>
        <h1 className='text-3xl font-bold'>Admin Dashboard</h1>
        {/* Add summary cards and other components here */}
      </AdminLayout>
    </ProtectedRoute>
  )
}

export default AdminDashboard
