'use client'

export const dynamic = 'force-dynamic'
import React from 'react'
import { useTeachers, useDeleteTeacher } from '@/hooks/useTeachers'
import TeacherList from '@/components/Teachers/TeacherList'
import Notification from '@/components/Layout/Notification'

export default function TeachersPage() {
  const { data: teachers = [], isLoading, error } = useTeachers()
  const deleteTeacherMutation = useDeleteTeacher()

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure?')) {
      try {
        await deleteTeacherMutation.mutateAsync(id)
      } catch (err) {
        console.error('Failed to delete teacher:', err)
      }
    }
  }

  return (
    <div className='container mx-auto p-4'>
      {(error || deleteTeacherMutation.error) && (
        <Notification
          message={
            error instanceof Error
              ? error.message
              : deleteTeacherMutation.error instanceof Error
                ? deleteTeacherMutation.error.message
                : 'An error occurred'
          }
          type='error'
          onClose={() => deleteTeacherMutation.reset()}
        />
      )}
      {isLoading ? (
        <p>Loading...</p>
      ) : (
        <TeacherList teachers={teachers} onDelete={handleDelete} />
      )}
    </div>
  )
}

