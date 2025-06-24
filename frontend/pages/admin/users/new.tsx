import React from 'react'
import ProtectedRoute from '../../../components/Auth/ProtectedRoute'
import AdminLayout from '../../../components/Layout/AdminLayout'
import UserForm from '../../../components/Users/UserForm'

const AddUserPage: React.FC = () => {
  return (
    <ProtectedRoute requiredRoles={['Admin']}>
      <AdminLayout>
        <UserForm />
      </AdminLayout>
    </ProtectedRoute>
  )
}

export default AddUserPage
