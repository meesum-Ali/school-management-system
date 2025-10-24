'use client'

export const dynamic = 'force-dynamic'
import React, { useContext } from 'react'
import { useRouter } from 'next/navigation'
import ClassForm from '@/components/Classes/ClassForm'
import { useCreateClass } from '@/hooks/useClasses'
import { CreateClassDto, UpdateClassDto } from '@/types/class'
import { UserRole } from '@/types/user'
import AdminLayout from '@/components/Layout/AdminLayout'
import Notification from '@/components/Layout/Notification'
import { AuthContext } from '@/contexts/AuthContext'

export default function CreateClassPage() {
  const router = useRouter()
  const { user } = useContext(AuthContext)
  const createClassMutation = useCreateClass()

  const handleSubmit = async (data: CreateClassDto | UpdateClassDto) => {
    const createData = data as CreateClassDto

    try {
      await createClassMutation.mutateAsync(createData)
      router.push('/admin/classes')
    } catch (err) {
      console.error('Failed to create class:', err)
    }
  }

  if (!user?.roles.includes(UserRole.SCHOOL_ADMIN)) {
    return (
      <AdminLayout>
        <div className='container mx-auto p-4'>
          <Notification
            message='You do not have permission to create classes.'
            type='error'
          />
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout>
      <div className='container mx-auto p-4 flex justify-center'>
        <div className='w-full max-w-lg'>
          {createClassMutation.error && (
            <Notification
              message={
                createClassMutation.error instanceof Error
                  ? createClassMutation.error.message
                  : 'Failed to create class'
              }
              type='error'
              onClose={() => createClassMutation.reset()}
            />
          )}
          <h1 className='text-2xl font-semibold mb-6 text-center'>
            Create New Class
          </h1>
          <ClassForm
            onSubmit={handleSubmit}
            isSubmitting={createClassMutation.isPending}
          />
        </div>
      </div>
    </AdminLayout>
  )
}
