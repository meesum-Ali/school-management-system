import React from 'react'
import { useRouter } from 'next/router'
import ProtectedRoute from '../../../components/Auth/ProtectedRoute'
import AdminLayout from '../../../components/Layout/AdminLayout'
import UserForm from '../../../components/Users/UserForm'

const EditUserPage: React.FC = () => {
  const router = useRouter()
  const { id } = router.query

  if (!id) {
    return <div>Loading...</div>
  }

  return (
    <ProtectedRoute roles={['Admin']}>
      <AdminLayout>
        <UserForm userId={Number(id)} />
      </AdminLayout>
    </ProtectedRoute>
  )
}

export default EditUserPage
