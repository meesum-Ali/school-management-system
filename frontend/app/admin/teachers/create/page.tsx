'use client'

export const dynamic = 'force-dynamic'
import React from 'react'
import { useRouter } from 'next/navigation'
import TeacherForm from '@/components/Teachers/TeacherForm'
import Notification from '@/components/Layout/Notification'
import { useCreateTeacher } from '@/hooks/useTeachers'
import { useUsers } from '@/hooks/useUsers'
import { CreateTeacherDto, UpdateTeacherDto } from '@/types/teacher'

export default function CreateTeacherPage() {
  const router = useRouter()
  const createTeacherMutation = useCreateTeacher()
  const { data: allUsers = [], isLoading: loadingUsers } = useUsers()

  // Filter users who don't have teacher profiles yet
  // Note: This requires backend to return users with teacher relationship or a separate endpoint
  // For now, we'll show all users - in production, filter out users who already have teacher profiles
  const availableUsers = allUsers

  const handleSubmit = async (data: CreateTeacherDto | UpdateTeacherDto) => {
    const createData = data as CreateTeacherDto

    try {
      await createTeacherMutation.mutateAsync(createData)
      router.push('/admin/teachers')
    } catch (err) {
      console.error('Failed to create teacher:', err)
    }
  }

  if (loadingUsers) {
    return (
      <div className='container mx-auto p-4'>
        <p>Loading users...</p>
      </div>
    )
  }

  if (availableUsers.length === 0) {
    return (
      <div className='container mx-auto p-4'>
        <Notification
          message='No users available. Please create users first before adding teachers.'
          type='error'
        />
      </div>
    )
  }

  return (
    <div className='container mx-auto p-4 max-w-2xl'>
      {createTeacherMutation.error && (
        <Notification
          message={
            createTeacherMutation.error instanceof Error
              ? createTeacherMutation.error.message
              : 'Failed to create teacher'
          }
          type='error'
          onClose={() => createTeacherMutation.reset()}
        />
      )}

      <div className='mb-4'>
        <h1 className='text-2xl font-bold'>Create New Teacher</h1>
      </div>

      <TeacherForm
        onSubmit={handleSubmit}
        isSubmitting={createTeacherMutation.isPending}
        availableUsers={availableUsers}
      />
    </div>
  )
}
