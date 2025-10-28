"use client"

import React from 'react'
import { useTeachers, useDeleteTeacher } from '@/hooks/useTeachers'
import Notification from '@/components/Layout/Notification'
import TeacherList from '@/components/Teachers/TeacherList'
import { Teacher } from '@/types/teacher'

interface TeachersPageClientProps {
  initialTeachers: Teacher[]
}

export default function TeachersPageClient({ initialTeachers }: TeachersPageClientProps) {
  const { data: teachers = [], isLoading, error } = useTeachers(initialTeachers)
  const deleteTeacherMutation = useDeleteTeacher()

  const handleDelete = async (id: string) => {
    if (
      window.confirm(
        'Are you sure you want to delete this teacher? This action cannot be undone.'
      )
    ) {
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

      {deleteTeacherMutation.isSuccess && (
        <Notification
          message='Teacher deleted successfully'
          type='success'
          onClose={() => deleteTeacherMutation.reset()}
        />
      )}

      {isLoading ? (
        <div className='flex justify-center items-center h-64'>
          <p className='text-gray-500'>Loading teachers...</p>
        </div>
      ) : (
        <TeacherList teachers={teachers} onDelete={handleDelete} />
      )}
    </div>
  )
}
