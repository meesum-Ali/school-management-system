'use client'

export const dynamic = 'force-dynamic'
import React from 'react'
import ClassList from '@/components/Classes/ClassList'
import { useClasses, useDeleteClass } from '@/hooks/useClasses'
import AdminLayout from '@/components/Layout/AdminLayout'
import Notification from '@/components/Layout/Notification'

export default function ClassesPage() {
  const { data: classes = [], isLoading, error } = useClasses()
  const deleteClassMutation = useDeleteClass()

  const handleDeleteClass = async (id: string) => {
    if (
      window.confirm(
        'Are you sure you want to delete this class? This action cannot be undone.',
      )
    ) {
      try {
        await deleteClassMutation.mutateAsync(id)
      } catch (err) {
        console.error('Failed to delete class:', err)
      }
    }
  }

  return (
    <AdminLayout>
      <div className='container mx-auto p-4'>
        {(error || deleteClassMutation.error) && (
          <Notification
            message={
              error instanceof Error
                ? error.message
                : deleteClassMutation.error instanceof Error
                  ? deleteClassMutation.error.message
                  : 'An error occurred'
            }
            type='error'
            onClose={() => deleteClassMutation.reset()}
          />
        )}
        {isLoading ? (
          <p className='text-center'>Loading classes...</p>
        ) : (
          <ClassList classes={classes} onDelete={handleDeleteClass} />
        )}
      </div>
    </AdminLayout>
  )
}
