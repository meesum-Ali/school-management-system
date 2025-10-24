'use client'

export const dynamic = 'force-dynamic'
import React from 'react'
import { useSchools, useDeleteSchool } from '@/hooks/useSchools'
import AdminLayout from '@/components/Layout/AdminLayout'
import SchoolList from '@/components/Schools/SchoolList'
import Notification from '@/components/Layout/Notification'

export default function SchoolsPage() {
  const { data: schools = [], isLoading, error } = useSchools()
  const deleteSchoolMutation = useDeleteSchool()

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure?')) {
      try {
        await deleteSchoolMutation.mutateAsync(id)
      } catch (err) {
        console.error('Failed to delete school:', err)
      }
    }
  }

  return (
    <AdminLayout>
      <div className='container mx-auto p-4'>
        {(error || deleteSchoolMutation.error) && (
          <Notification
            message={
              error instanceof Error
                ? error.message
                : deleteSchoolMutation.error instanceof Error
                  ? deleteSchoolMutation.error.message
                  : 'An error occurred'
            }
            type='error'
            onClose={() => deleteSchoolMutation.reset()}
          />
        )}
        {isLoading ? (
          <p>Loading...</p>
        ) : (
          <SchoolList schools={schools} onDelete={handleDelete} />
        )}
      </div>
    </AdminLayout>
  )
}
