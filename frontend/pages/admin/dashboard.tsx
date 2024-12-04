import React from 'react'
import ProtectedRoute from '../../components/Auth/ProtectedRoute'
import AdminLayout from '../../components/Layout/AdminLayout'

const AdminDashboard: React.FC = () => {
  return (
    <ProtectedRoute roles={['Admin']}>
      <AdminLayout>
        <h1 className='text-3xl font-bold'>Admin Dashboard</h1>
        {/* Add summary cards and other components here */}
      </AdminLayout>
    </ProtectedRoute>
  )
}

export default AdminDashboard
