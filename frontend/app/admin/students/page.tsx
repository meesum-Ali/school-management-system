'use client'

export const dynamic = 'force-dynamic'
import React from 'react'
import { useStudents, useDeleteStudent } from '@/hooks/useStudents'
import StudentList from '@/components/Students/StudentList'
import Notification from '@/components/Layout/Notification'

export default function StudentsPage() {
  const { data: students = [], isLoading, error } = useStudents()
  const deleteStudentMutation = useDeleteStudent()

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure?')) {
      try {
        await deleteStudentMutation.mutateAsync(id)
      } catch (err) {
        console.error('Failed to delete student:', err)
      }
    }
  }

  return (
    <div className='container mx-auto p-4'>
      {(error || deleteStudentMutation.error) && (
        <Notification
          message={
            error instanceof Error
              ? error.message
              : deleteStudentMutation.error instanceof Error
                ? deleteStudentMutation.error.message
                : 'An error occurred'
          }
          type='error'
          onClose={() => deleteStudentMutation.reset()}
        />
      )}
      {isLoading ? (
        <p>Loading...</p>
      ) : (
        <StudentList students={students} onDelete={handleDelete} />
      )}
    </div>
  )
}
