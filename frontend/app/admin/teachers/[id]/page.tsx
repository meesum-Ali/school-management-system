'use client'

export const dynamic = 'force-dynamic'
import React from 'react'
import { useRouter, useParams } from 'next/navigation'
import TeacherForm from '@/components/Teachers/TeacherForm'
import Notification from '@/components/Layout/Notification'
import { useTeacher, useUpdateTeacher } from '@/hooks/useTeachers'
import { CreateTeacherDto, UpdateTeacherDto } from '@/types/teacher'

export default function EditTeacherPage() {
  const router = useRouter()
  const params = useParams()
  const teacherId = params?.id as string

  const { data: teacher, isLoading, error } = useTeacher(teacherId)
  const updateTeacherMutation = useUpdateTeacher()

  const handleSubmit = async (data: CreateTeacherDto | UpdateTeacherDto) => {
    const updateData = data as UpdateTeacherDto

    try {
      await updateTeacherMutation.mutateAsync({
        id: teacherId,
        dto: updateData,
      })
      router.push('/admin/teachers')
    } catch (err) {
      console.error('Failed to update teacher:', err)
    }
  }

  if (isLoading) {
    return (
      <div className='container mx-auto p-4'>
        <p>Loading teacher...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className='container mx-auto p-4'>
        <Notification
          message={
            error instanceof Error ? error.message : 'Failed to load teacher'
          }
          type='error'
        />
      </div>
    )
  }

  if (!teacher) {
    return (
      <div className='container mx-auto p-4'>
        <Notification message='Teacher not found' type='error' />
      </div>
    )
  }

  return (
    <div className='container mx-auto p-4 max-w-2xl'>
      {updateTeacherMutation.error && (
        <Notification
          message={
            updateTeacherMutation.error instanceof Error
              ? updateTeacherMutation.error.message
              : 'Failed to update teacher'
        }
        type='error'
        onClose={() => updateTeacherMutation.reset()}
      />
    )}

    <div className='mb-4'>
      <h1 className='text-2xl font-bold'>Edit Teacher</h1>
    </div>

    <TeacherForm
      teacher={teacher}
      onSubmit={handleSubmit}
      isSubmitting={updateTeacherMutation.isPending}
    />
  </div>
)
}
