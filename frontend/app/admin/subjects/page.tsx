'use client'

export const dynamic = 'force-dynamic'
import React from 'react'
import { useSubjects, useDeleteSubject } from '@/hooks/useSubjects'
import SubjectList from '@/components/Subjects/SubjectList'
import Notification from '@/components/Layout/Notification'

export default function SubjectsPage() {
  const { data: subjects = [], isLoading, error } = useSubjects()
  const deleteSubjectMutation = useDeleteSubject()

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure?')) {
      try {
        await deleteSubjectMutation.mutateAsync(id)
      } catch (err) {
        console.error('Failed to delete subject:', err)
      }
    }
  }

  return (
    <div className='container mx-auto p-4'>
      {(error || deleteSubjectMutation.error) && (
        <Notification
          message={
            error instanceof Error
              ? error.message
              : deleteSubjectMutation.error instanceof Error
                ? deleteSubjectMutation.error.message
                : 'An error occurred'
          }
          type='error'
          onClose={() => deleteSubjectMutation.reset()}
        />
      )}
      {isLoading ? (
        <p>Loading...</p>
      ) : (
        <SubjectList subjects={subjects} onDelete={handleDelete} />
      )}
    </div>
  )
}
