import React from 'react'
import ProtectedRoute from '../../components/Auth/ProtectedRoute'
import AdminLayout from '../../components/Layout/AdminLayout'
import UserList from '../../components/Users/UserList'

const UserManagementPage: React.FC = () => {
  return (
    <ProtectedRoute roles={['Admin']}>
      <AdminLayout>
        <UserList />
      </AdminLayout>
    </ProtectedRoute>
  )
}

export default UserManagementPage
