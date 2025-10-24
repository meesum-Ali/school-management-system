'use client'

export const dynamic = 'force-dynamic'
import React from 'react'
import { useUsers, useDeleteUser } from '@/hooks/useUsers'
import AdminLayout from '@/components/Layout/AdminLayout'
import UserList from '@/components/Users/UserList'
import Notification from '@/components/Layout/Notification'

export default function UsersPage() {
  const { data: users = [], isLoading, error } = useUsers()
  const deleteUserMutation = useDeleteUser()

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure?')) {
      try {
        await deleteUserMutation.mutateAsync(id)
      } catch (err) {
        console.error('Failed to delete user:', err)
      }
    }
  }

  return (
    <AdminLayout>
      <div className='container mx-auto p-4'>
        {(error || deleteUserMutation.error) && (
          <Notification
            message={
              error instanceof Error
                ? error.message
                : deleteUserMutation.error instanceof Error
                  ? deleteUserMutation.error.message
                  : 'An error occurred'
            }
            type='error'
            onClose={() => deleteUserMutation.reset()}
          />
        )}
        {isLoading ? (
          <p>Loading...</p>
        ) : (
          <UserList users={users} onDelete={handleDelete} />
        )}
      </div>
    </AdminLayout>
  )
}
